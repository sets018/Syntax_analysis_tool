# Pasos necesarios para hacer el analisis sintactico

## 1- Leer gramatica desde el archivo 
Funcion read_file(path)
Input : Path del archivo.txt con la gramatica, cada produccion esta separada por salto de linea 

Output : Array con cada produccion sin procesar

Funcion read_grammar(lines)
Input : Array con cada produccion sin procesar

Output : Diccionario en el que cada key es un no terminal y los values son arrays con cada una de las producciones que produce ese no terminal (diccionario con gramatica procesada)

## Eliminar recursividad y factorizacion por izquierda
Funcion detect_fix_left_recursion_and_left_factoring(productions)
Input : (diccionario con gramatica procesada)

Output : (diccionario con gramatica procesada sin recursividad a izquierda y factorizada a izquierda)


## Siguientes y Primeros de cada no terminal 

Funcion get_firsts_all_non_terminals(productions)
Input : (diccionario con gramatica procesada sin recursividad a izquierda y factorizada a izquierda)

Output : (diccionario en el que cada key es un no terminal y cada value es la lista de primeros de ese no terminal)

Funcion get_nexts_all_non_terminals(productions, firsts)
Input : (diccionario con gramatica procesada sin recursividad a izquierda y factorizada a izquierda), (diccionario en el que cada key es un no terminal y cada value es la lista de primeros de ese no terminal)

Output : (diccionario en el que cada key es un no terminal  y cada value es la lista de siguientes de ese no terminal)

## Tabla m construida 

Funcion build_m_table(productions, nexts)
Input : (diccionario con gramatica procesada sin recursividad a izquierda y factorizada a izquierda), (diccionario en el que cada key es un no terminal  y cada value es la lista de siguientes de ese no terminal)

Output : (diccionario de diccionarios que es la representacion de la tabla m), lista de filas de la tabla m, lista de columnas de la tabla m

## Analisis sintactico dado una cadena para determinar si pertenece al lenguaje de la gramatica o no 
To do 

## Mostrar gramatica 
Funcion print_grammar(grammar)
Input : (gramatica procesada)

Output : Imprime la gramatica
