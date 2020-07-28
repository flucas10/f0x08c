let editor     = document.getElementById("editor"    ),
    equivalent = document.getElementById("equivalent"),
    assemble   = document.getElementById("assemble"  ),
    assembled  = document.getElementById("assembled" );

editor.addEventListener("input", (e) => {
    translate(editor.value);
});

assemble.addEventListener("click", (e) => {
    assembler(equivalent.value);
});

let indexs = {
    /*"NOP" : 0, "LDI" : 1, "ALU" : 2,
    "JMP" : 3, "PUSH": 4, "POP" : 5,
    "CALL": 6, "RET" : 7,*/
    "PC"  : 1, "ACA" : 2, "ACB" : 3, 
    "GREGA": 4, "IOO": 5, "IOI"  : 6,

    "GREG": "GREG",

    "/": 0, "=0"  : 1, "&1"  : 2, ">255": 3,
    "!=0" : 4, "!&1" : 5, "!>255": 6,
};

function translate(program) {
    equivalent.value = "";
    program = program.split("\n");

    let sub = [];
    let call = [];
    
    for (let i of program) {
        let line = i.toUpperCase().split(" ");
        if ((line[0] != ":"))
        equivalent.value += (equivalent.value.split("\n").length - 1) + ": "

        if (line[0] == ":") {
            sub.push([line[1], equivalent.value.split("\n").length - 1])
        }
        else if (line[0] === "NOP") {
            equivalent.value += "NOP\n";
        }
        else if (line[0] === "LDI") {
            equivalent.value += "LDI " + line[1] + " " + indexs[line[2]] + "\n";
        }
        else if (line[0] === "SETA") {
            equivalent.value += "ALU 1 " + indexs[line[1]] + "\n";
        }
        else if (line[0] === "SETB") {
            equivalent.value += "ALU 2 " + indexs[line[1]] + "\n";
        }
        else if (line[0] === "ADD") {
            equivalent.value += "ALU 8 " + indexs[line[1]] + "\n";
        }
        else if (line[0] === "INCA") {
            equivalent.value += "ALU 12 " + indexs[line[1]] + "\n";
        }
        else if (line[0] === "INCB") {
            equivalent.value += "ALU 13 " + indexs[line[1]] + "\n";
        }
        else if (line[0] === "SUB") {
            equivalent.value += "ALU 9 " + indexs[line[1]] + "\n";
        }
        else if (line[0] === "DECA") {
            equivalent.value += "ALU 14 " + indexs[line[1]] + "\n";
        }
        else if (line[0] === "DECA") {
            equivalent.value += "ALU 15 " + indexs[line[1]] + "\n";
        }
        else if (line[0] === "JMP") {
            equivalent.value += "JMP " + indexs[line[1]] + " " + line[2] + "\n";
        }
        else if (line[0] === "PUSH") {
            equivalent.value += "PUSH " + indexs[line[1]] + "\n";
        }
        else if (line[0] === "POP") {
            equivalent.value += "POP " + indexs[line[1]] + "\n";
        }
        else if (line[0] === "CALL") {
            equivalent.value += "CALL " + line[1]  + "\n";
            call.push(line[1]);
        }
        else if (line[0] === "RET") {
            equivalent.value += "RET\n";
        }
        else if (line[0] === "MOV") {
            equivalent.value += "PUSH " + indexs[line[1]] + "\n";
        equivalent.value += (equivalent.value.split("\n").length - 1) + ": "
            equivalent.value += "POP " + indexs[line[2]] + "\n";
        }
    }

    for (let i in call)
        equivalent.value = equivalent.value.replace("CALL " + call[i], "CALL " + sub[sub.findIndex(e => e[0] === call[i])][1]);
}
function assembler(program) {
    assembled.value = "";
    program = program.replace(/[\d,]+[:]/g, "").split("\n").map(e => e.replace(/\s?/i, ""));


    for (let i = 0; i < program.length; i++) {
        let line = program[i].toUpperCase().split(" ");

        if (line[0] === "NOP") {
            assembled.value += "0b00000000000000,\n";
        }
        else if (line[0] === "LDI") {
            assembled.value += "0b001" + parseInt(line[1]).toString(2).padStart(8, "0") + parseInt(line[2]).toString(2).padStart(3, "0") + ",\n";
        }
        else if (line[0] === "ALU") {
            assembled.value += "0b0100000" + parseInt(line[1]).toString(2).padStart(4, "0") + parseInt(line[2]).toString(2).padStart(3, "0") + ",\n";
        }
        else if (line[0] === "JMP") {
            assembled.value += "0b011" + parseInt(line[1]).toString(2).padStart(3, "0") + parseInt(line[2]).toString(2).padStart(8, "0") + ",\n";
        }
        else if (line[0] === "PUSH") {
            if (line[1] === "GREG") {
                assembled.value += "0b10010000000000" + ",\n";
            }
            else {
                assembled.value += "0b10000000000" + parseInt(line[1]).toString(2).padStart(3, "0") + ",\n";
            }
        }
        else if (line[0] === "POP") {
            if (line[1] === "GREG") {
                assembled.value += "0b10110000000000" + ",\n";
            }
            else {
                assembled.value += "0b10100000000" + parseInt(line[1]).toString(2).padStart(3, "0") + ",\n";
            }
        }
        else if (line[0] === "CALL") {
            assembled.value += "0b110" + parseInt(line[1]).toString(2).padStart(8, "0") + "000,\n";
        }
        else if (line[0] === "RET") {
            assembled.value += "0b11100000000000,\n";
        }
        else if (line[0] === "JMP") {
            assembled.value += "0b011" + parseInt(line[1]).toString(2).padStart(3, "0") + parseInt(line[2]).toString(2).padStart(8, "0") + ",\n";
        }
    }
}
