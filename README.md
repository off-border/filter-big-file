### Filter Big FIle ###

A simple script to filter text files and exclude text blocks not matching to search parameters

## installation ##
```
npm install --global filter-big-file
```

## Options ##
```--inputFile``` (required) - path to the source file

```--outputFile``` (required) - path to the result file

```--searchString``` (required) - text that should be contained by proper blocks

```--blockSeparator``` (default: \n) - pattern to separate different blocks in text

## Example ##
```
filter-big-file --inputFile=src/test-data.txt --outputFile=src/test-data-out-bin.txt --searchString='line 9' --blockSeparator=$'\n\r\n'
```