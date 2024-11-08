
export function print_grammar(grammar) {
    for (const non_terminal in grammar) {
        grammar[non_terminal].forEach(
            production => {
                console.log(`${non_terminal}->${production}`);
            }
        );
    }
}

export function read_grammar(text) {
    const productions = {};
    // Saves all the productions in an object where the key is the non-terminal (head of the production)
    // and the value is a list with the bodies of the productions.
    lines = text.split('\n');
    lines.forEach(line => {
        const production = line.trim();
        if (production === '') return;

        const [head, body] = production.split('->').map(s => s.trim());
        if (!productions[head]) {
            productions[head] = [];
        }
        productions[head].push(body);
    });
    return productions;
}
function detect_fix_left_recursion_and_left_factoring(productions) {
    const needed_productions = {};
    const non_terminals = new Set(Object.keys(productions));

    // Helper function to get the next available alphabetical letter for a new non-terminal
    function get_new_non_terminal() {
        for (let char = 65; char <= 90; char++) { // ASCII codes for A-Z
            const new_non_terminal = String.fromCharCode(char);
            if (!non_terminals.has(new_non_terminal)) {
                non_terminals.add(new_non_terminal); // Mark as used
                return new_non_terminal;
            }
        }
        throw new Error("Ran out of single-character non-terminals");
    }

    // Helper function to find the longest common prefix
    function find_common_prefix(productions) {
        if (productions.length === 0) return '';
        let prefix = productions[0];
        for (let i = 1; i < productions.length; i++) {
            while (productions[i].indexOf(prefix) !== 0) {
                prefix = prefix.slice(0, -1);
                if (prefix === '') return '';
            }
        }
        return prefix;
    }

    // Step 1: Detect and remove left recursion for each non-terminal
    for (const non_terminal in productions) {
        const recursive_productions = [];
        const non_recursive_productions = [];

        // Classify each production as recursive or non-recursive
        productions[non_terminal].forEach(production => {
            if (production.startsWith(non_terminal)) {
                recursive_productions.push(production.slice(non_terminal.length).trim());
            } else {
                non_recursive_productions.push(production);
            }
        });

        if (recursive_productions.length > 0) {
            const new_non_terminal = get_new_non_terminal();
            needed_productions[non_terminal] = [];
            needed_productions[new_non_terminal] = [];

            recursive_productions.forEach(alpha => {
                needed_productions[new_non_terminal].push(`${alpha}${new_non_terminal}`);
            });
            needed_productions[new_non_terminal].push('&');

            non_recursive_productions.forEach(beta => {
                needed_productions[non_terminal].push(`${beta}${new_non_terminal}`);
            });
        } else {
            needed_productions[non_terminal] = productions[non_terminal];
        }

        // Step 2: Apply left factoring on the updated productions for the non-terminal
        const factored_productions = needed_productions[non_terminal];
        let remaining_productions = [];
        const groups = {};

        factored_productions.forEach(prod => {
            // Find common prefix among productions
            const prefix = find_common_prefix(factored_productions);
            if (prefix && prod.startsWith(prefix)) {
                if (!groups[prefix]) groups[prefix] = [];
                groups[prefix].push(prod.slice(prefix.length).trim());
            } else {
                remaining_productions.push(prod);
            }
        });

        // Process each group with common prefix
        for (const prefix in groups) {
            if (groups[prefix].length > 1) {
                const new_non_terminal = get_new_non_terminal();
                needed_productions[new_non_terminal] = groups[prefix].map(suffix => suffix || '&');
                remaining_productions.push(`${prefix}${new_non_terminal}`);
            } else {
                remaining_productions = remaining_productions.concat(groups[prefix].map(suffix => `${prefix}${suffix}`));
            }
        }

        // Update productions with factored results
        needed_productions[non_terminal] = remaining_productions;
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

        // Check if target is the last character
        if (index === str.length - 1) return '&';

        // Return the next character in the production
        return str[index + 1];
    }

    function produces_epsilon(production, firsts) {
        for (let i = 0; i < production.length; i++) {
            const symbol = production[i];
    
            if (firsts[symbol]) {
                if (!firsts[symbol].includes('&')) {
                    return false; // If any symbol in `production` cannot produce ε, stop and return false
                }
            } else {
                return false; // If the symbol is not in `firsts`, it cannot produce ε
            }
        }
        return true; // All symbols in `production` can produce ε
    }

    const nexts = [];
    if (target_non_terminal === non_terminals[0]) nexts.push('$'); // Start symbol has `$` in FOLLOW

    // Iterate over each non-terminal and its productions
    for (const non_terminal of non_terminals) {
        productions[non_terminal].forEach(production => {
            const next = find_next_char(target_non_terminal, production);

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

function build_m_table(productions, nexts) {
    function get_firsts_alpha(production, productions, non_terminals) {
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
        const firsts = [];
        let allEpsilon = true; // Track if all symbols in the production can be epsilon
    
        for (const symbol of production) {
            if (!non_terminals.includes(symbol)) {
                // If symbol is a terminal, add it to firsts and stop
                firsts.push(symbol);
                allEpsilon = false; // Found a terminal, so not all can be epsilon
                break;
            } else {
                // If symbol is a non-terminal, get its FIRST set
                const nested_firsts = get_firsts(symbol, productions, non_terminals);
                firsts.push(...nested_firsts.filter(x => x !== "ε")); // Add non-epsilon firsts
    
                // If epsilon is not in the FIRST set of the symbol, stop the loop
                if (!nested_firsts.includes("ε")) {
                    allEpsilon = false;
                    break;
                }
            }
        }
        
        // If all symbols in the production can lead to epsilon, add epsilon
        if (allEpsilon) {
            firsts.push("ε");
        }
    
        return firsts;
    }

    const m_table = {};
    const rows = Object.keys(productions);

    const all_productions_right = Object.values(productions).flat();
    // Filter out single capital letters in each string
    const columns = [];

    all_productions_right.forEach(str => {
        for (const char of str) {
            // Check if character is not a single uppercase letter and is not "&"
            if (!(char >= 'A' && char <= 'Z') && char !== '&') {
                columns.push(char);
            }
        }
    });
    columns.push('$');  
    // Initialize M table
    for (const non_terminal in rows) {
        m_table[rows[non_terminal]] = {};
        for (const terminal in columns) {
            m_table[rows[non_terminal]][columns[terminal]] = {};    
        }
    }

    for (const non_terminal in productions) {
        const right_productions = productions[non_terminal];

        right_productions.forEach(production => {
            // Calculate FIRST(α)
            const first_alpha = get_firsts_alpha(production, productions, rows);

            // Step 2: For each terminal a in FIRST(α), add A → α to M[A][a]
            first_alpha.forEach(terminal => {
                if (terminal !== '&') {  // Only add if terminal is not epsilon
                    m_table[non_terminal][terminal] = `${non_terminal}→${production}`;
                }
            });

            // Step 3: If ε is in FIRST(α), add A → α to M[A][b] for each b in FOLLOW(A)
            if (first_alpha.includes('&')) {
                nexts[non_terminal].forEach(next => {
                    m_table[non_terminal][next] = `${non_terminal}→${production}`;
                });
            }
    });
}
    return m_table
}

const lines = read_file("/workspaces/Syntax_analysis_tool/grammar.txt");
const grammar = read_grammar(lines);
console.log("Grammar input"); 
print_grammar(grammar);
console.log("Non left-recursive, left-factored grammar"); 
non_recursive = detect_fix_left_recursion_and_left_factoring(grammar);
console.log("Firsts of each non-terminal");
all_firsts = get_firsts_all_non_terminals(non_recursive);
console.log(all_firsts)
console.log("Nexts of each non-terminal");
all_nexts =  get_nexts_all_non_terminals(non_recursive, all_firsts)
console.log(all_nexts);
//m_table = get_firsts_alpha("T*F", non_recursive, Object.keys(non_recursive))
m_table = build_m_table(non_recursive, all_nexts)
console.log(m_table);
