const { log } = require('console');
const fs = require('fs');

function read_file(path) {
  const content = fs.readFileSync(path, 'utf-8');
  const lines = content.split('\n'); // Splitting the file by new lines
  return lines;
}

function print_grammar(grammar){
    for (const non_terminal in grammar){
        grammar[non_terminal].forEach(
            production => {
                console.log(`${non_terminal} -> ${production}`)

            }
        );
    }
}

function read_grammar(lines){
    const productions = {};
    // Saves all the productions on a dict where the key is the non terminal (head of the production) and the value is a list with the bodys of the productions
    lines.forEach(
        line => {
            const production = line.trim();

            if (production === '') {
                return;
            }

            const [head, body] = production.split('->').map(s => s.trim());

            if (!productions[head]){
                productions[head] = [];
            }
                productions[head].push(body);

        }
    );
    return productions  
}

function detect_fix_left_recursion(productions) {
    // Stores productions needed to fix recursion for all non terminals
    const needed_productions = {};
    // Detects and removes all left recursion from each of the productions
    for (const non_terminal in productions) {
        const recursive_productions = [];
        const non_recursive_productions = [];

        // for each of the productions of each non terminal
        productions[non_terminal].forEach(
            production => {
                // if the production is recursive push what comes after the recursive non temrinal (alpha) to the recursive array 
                if(production.startsWith(non_terminal)){
                    // Example A -> A(alpha) push (alpha) into the recursive array
                    recursive_productions.push(production.slice(non_terminal.length).trim());
                }
                // if the production is not recursive push to the non recursive array (beta)
                else{
                    non_recursive_productions.push(production);
                }
            }
        );

        if (recursive_productions.length > 0){
            // A'
            new_non_terminal = `${non_terminal}'`
            // Productions needed to fix recursion for a given non temrinal A
            needed_productions[non_terminal] = [];
            // Productions needed to fix recursion for a new non temrinal A´
            needed_productions[new_non_terminal] = [];

            // For A -> A(alpha), transform into A' -> (alpha)A' | (epsilon) (| (epsilon) is added later as a separate production)
            recursive_productions.forEach(
                production => {
                    needed_productions[new_non_terminal].push(`${production}${new_non_terminal}`);

                }

            );
            // Ads | (epsilon) as a separate production
            needed_productions[new_non_terminal].push('&')

            // For A -> (beta), transform into A -> (beta)A'
            non_recursive_productions.forEach(
                production => {
                    needed_productions[non_terminal].push(`${production}${new_non_terminal}`);

                }

            );

        }
        else{
            needed_productions[non_terminal] = productions[non_terminal]; 
        }
    }
    return needed_productions;
}

function get_firsts_all_non_terminals(productions){
    function get_firsts(non_terminal, productions, non_terminals){
        const firsts = [];
        // for each of the productions of a given non terminal
        productions[non_terminal].forEach(
            production => {
                const first = production[0];
                if (non_terminals.includes(first)){
                    const nested_firsts = get_firsts(first, productions, non_terminals);
                    firsts.push(...nested_firsts);
                }
                else{
                    firsts.push(first);
                }

            }
                
        );
        return firsts
}
    const firsts_all_non_terminals = {};
    const non_terminals = Object.keys(productions);
    non_terminals.forEach(
        non_terminal => {
            firsts_all_non_terminals[non_terminal] = get_firsts(non_terminal, productions, non_terminals)
        }
    );
    return firsts_all_non_terminals 
}

function get_nexts(target_non_terminal, productions, firsts, non_terminals, visited = new Set()) {
    // Check if the non-terminal is already being processed in this recursive chain
    if (visited.has(target_non_terminal)) return []; // Prevent infinite recursion

    // Add the current non-terminal to the visited set
    visited.add(target_non_terminal);

    function find_next_char(target, str) {
        let index = str.indexOf(target);

        // Return -1 if target is not in the string
        if (index === -1) return -1;

        // Handle if `target` is followed by a prime symbol (apostrophe)
        const found = (str[index + 1] === "'");
        if (found) {
            index = str.indexOf(target, index + 2);
            if (index === -1) return -1;
        }

        // Check if target is the last character
        if (index === str.length - 1) return '&';

        // Check the character next to the target
        const next = str[index + 1];

        // If next character is an uppercase letter followed by an apostrophe, retrieve both
        return /[A-Z]/.test(next) && str[index + 2] === "'" ? next + "'" : next;
    }

    function find_next_char_prime(target, str) {
        const index = str.indexOf(target);
        const found = ((index !== -1) && (str[index + 1] === "'"));

        // Return -1 if target is not found
        if (!found) return -1;

        // Check if target is the last character
        if (index + 1 === str.length - 1) return '&';

        // Check the character next to the target
        const next = str[index + 2];
        return /[A-Z]/.test(next) && str[index + 3] === "'" ? next + "'" : next;
    }

    function produces_epsilon(production, firsts) {
        for (let i = 0; i < production.length; i++) {
            const symbol = production[i];
            // Handle multi-character non-terminals like "E'" if they exist
            const fullSymbol = (production[i + 1] === "'") ? symbol + "'" : symbol;
    
            if (firsts[fullSymbol]) {
                if (!firsts[fullSymbol].includes('&')) {
                    return false; // If any symbol in `production` cannot produce ε, stop and return false
                }
            } else {
                return false; // If the symbol is not in `firsts`, it cannot produce ε
            }
    
            // Skip the next character if it was part of a multi-character symbol (e.g., "E'")
            if (fullSymbol.length > 1) {
                i++;
            }
        }
        return true; // All symbols in `production` can produce ε
    }

    const nexts = [];
    if (target_non_terminal === non_terminals[0]) nexts.push('$'); // Start symbol has `$` in FOLLOW

    // Iterate over each non-terminal and its productions
    for (const non_terminal of non_terminals) {
        productions[non_terminal].forEach(production => {
            const next = target_non_terminal.length === 1
                ? find_next_char(target_non_terminal, production)
                : find_next_char_prime(target_non_terminal, production);

            if (next !== -1) {
                if (!non_terminals.includes(next)) {
                    // If `next` is a terminal and not ε, add it to `nexts`
                    if (next !== '&') {
                        nexts.push(next);
                    } else if (next === '&') {
                        // Handle `&` case: inherit `FOLLOW(non_terminal)` into `nexts`
                        const nested_nexts = get_nexts(non_terminal, productions, firsts, non_terminals, visited);
                        nexts.push(...nested_nexts);
                    }
                } else {
                    // `next` is a non-terminal
                    const firsts_next = firsts[next];
                    if (firsts_next.includes('&')) {
                        // If `next` has ε in its FIRST set, add other symbols
                        const firsts_next_non_epsilon = firsts_next.filter(item => item !== '&');
                        nexts.push(...firsts_next_non_epsilon);

                        const remaining_production = production.slice(production.indexOf(target_non_terminal) + target_non_terminal.length).trim();
                        if (produces_epsilon(remaining_production, firsts)) {
                            // Inherit FOLLOW set of `non_terminal` recursively
                            const nested_nexts = get_nexts(non_terminal, productions, firsts, non_terminals, visited);
                            nexts.push(...nested_nexts);
                        }
                    } else {
                        nexts.push(...firsts_next);
                    }
                }
            }
        });
    }

    // Remove the current non-terminal from visited before returning
    visited.delete(target_non_terminal);

    // Return unique items in the `nexts` array
    return [...new Set(nexts)];
}

function get_nexts_all_non_terminals(productions, firsts){
    const nexts_all_non_terminals = {};
    const non_terminals = Object.keys(productions);
    non_terminals.forEach(
        non_terminal => {
            nexts_all_non_terminals[non_terminal] = get_nexts(non_terminal, productions, firsts, non_terminals)
        }
    );
    return nexts_all_non_terminals 
}




const lines = read_file("/workspaces/Compilers-Lab-PHP/syntax_analysis/grammar.txt");
const grammar = read_grammar(lines);
console.log("Grammar input"); 
print_grammar(grammar);
console.log("Non left-recursive grammar"); 
non_recursive = detect_fix_left_recursion(grammar);
print_grammar(non_recursive);
console.log("Non left-recursive, left-factored grammar");
print_grammar(non_recursive);
console.log("Firsts of each non-terminal");
all_firsts = get_firsts_all_non_terminals(non_recursive);
console.log(all_firsts)
console.log("Nexts of each non-terminal");
all_nexts =  get_nexts_all_non_terminals(non_recursive, all_firsts)
console.log(all_nexts);