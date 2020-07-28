let PROM = new Uint16Array(256),
    REG  = new Uint8Array (  8),
    GREG = new Uint8Array (256),
    SREG = new Uint8Array (256),
    SREGi = 0,
    FLAGS = new Uint8Array(3);

let ePROM = document.getElementById("PROM"),
    eGREG = document.getElementById("GREG"),
    eSREG = document.getElementById("SREG"),
    eCPU  = document.getElementById("CPU" ),
    loadPROM = document.getElementById("loadPROM");

let indexs = {
    OPCODE: {
        "NOP" : 0, "LDI" : 1, "ALU" : 2,
        "JMP" : 3, "PUSH": 4, "POP" : 5,
        "CALL": 6, "RET" : 7
    },
    REG: {
        1: "PC", 2: "ACa", 3: "ACb", 
        4: "GREGA", 5: "IOo", 6: "IOi",
        7: "PIR"
    },
};

function ALU(UF=0, SF=0, OP=0) {

    let result;

    if (SF > 0) {
        FLAGS[ SF & 0b001] = UF;
        FLAGS[(SF & 0b010 >> 1)] = UF;
        FLAGS[(SF & 0b100 >> 2)] = UF;
    }
    
    if (OP == 1) { // A
        result = REG[2];

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
        }
    }
    else if (OP == 2) { // B
        result = REG[3];

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
        }
    }
    else if (OP == 3) { // NOT A
        result = REG[2] ^ 0xFF;

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
        }
    }
    else if (OP == 4) { // NOT B
        result = REG[3] ^ 0xFF;

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
        }
    }
    else if (OP == 5) { // A OR B
        result = REG[2] | REG[3];

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
        }
    }
    else if (OP == 6) { // A AND B
        result = REG[2] & REG[3];

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
        }
    }
    else if (OP == 7) { // A XOR B
        result = REG[2] ^ REG[3];

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
        }
    }
    else if (OP == 8) {  // A ADD B
        result = REG[2] + REG[3];

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
            FLAGS[2] = result > 255;
        }

        return result & 255;
    }
    else if (OP == 9) { // A SUB B
        result = REG[2] - REG[3];

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
            FLAGS[2] = result >= 0;
        }

        return result & 255;
    }
    else if (OP == 10) {  // A ADC B
        result = REG[2] + REG[3] + 1;

        if (UF) {
            FLAGS[0] = resultS == 0;
            FLAGS[1] = resultS & 1;
            FLAGS[2] = resultS > 255;
        }

        return result;
    }
    else if (OP == 11) { // A SBC B
        result = REG[2] - REG[3] - 1;

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
            FLAGS[2] = result >= 0;
        }

        return result & 255;
    }
    else if (OP == 12) {  // INC A
        result = REG[2] + 1;

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
            FLAGS[2] = result > 255;
        }

        return result & 255;
    }
    else if (OP == 13) { // INC B
        result = REG[3] + 1;

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
            FLAGS[2] = result >= 0;
        }

        return result & 255;
    }
    else if (OP == 14) {  // DEC A
        result = REG[2] - 1;

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
            FLAGS[2] = result > 255;
        }

        return result &255;
    }
    else if (OP == 15) { // DEC B
        result = REG[3]- 1;

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
            FLAGS[2] = result >= 0;
        }

        return result & 255;
    }

    return result;
}

function TEST(OP=0) {

    if (OP == 0)
        return 1;

    /*
    1: == 0
    2: LSB
    3: Overflow
    4: != 0
    5: !LSB
    6: !Overflow
    */

    return OP < 4 ? FLAGS[OP - 1] : FLAGS[OP - 4] ^ 1;
}

function runOPCode(OP=0, ARG1=0, ARG2=0) {

    if (OP == 0) {
    }
    else if (OP == 1) { //LDI
        if (ARG2 > 0 && ARG2 < 7)
            REG[ARG2] = ARG1;
    }
    else if (OP == 2) { //ALU
        if (ARG2 > 0 && ARG2 < 7)
            REG[ARG2] = ALU(ARG1 >> 7, (ARG1 & 0b01110000) >> 4, ARG1 & 0b1111);
    }
    else if (OP == 3) { //JMP
        if (TEST(ARG1 >> 5))
            REG[1] = ((ARG1 & 0b11111) << 3 | ARG2) - 1;
    }
    else if (OP == 4) { //PUSH
        if (ARG1 >> 7) {
            SREG[SREGi] = GREG[REG[4]];
            SREGi++;
        }
        else if (ARG2 > 0 && ARG2 < 7) {
            SREG[SREGi] = REG[ARG2];
            SREGi++;
        }
    }
    else if (OP == 5) { //POP
        if (ARG1 >> 7) {
            SREGi--;
            GREG[REG[4]] = SREG[SREGi];
            SREG[SREGi] = 0;
        }
        else if (ARG2 > 0 && ARG2 < 7) {
            SREGi--;
            REG[ARG2] = SREG[SREGi];
            SREG[SREGi] = 0;
        }
    }
    else if (OP == 6) { //CALL
        for (let i = 1; i < 8; i++) {
            SREG[SREGi] = REG[i];
            REG[i] = 0;
            SREGi++;
        }
        REG[1] = ARG1 - 1;
    }
    else if (OP == 7) { //RET
        for (let i = 7; i > 0 ; i--) {
            SREGi--;
            REG[i] = SREG[SREGi];
            SREG[SREGi] = 0;
        }
    }
}

loadPROM.addEventListener("click", (e) => loadProgram());

function loadProgram() {

    for (let i in ePROM.value.split(",\n"))
        PROM[i] = parseInt(ePROM.value.replace(/0b/g, "").split(",\n")[i], 2);

    let interval = setInterval(() => {
        process();
        display();
    });
}

function process() {

    let OP   = (PROM[REG[1]] & 0b11100000000000) >> 11,
        ARG1 = (PROM[REG[1]] & 0b00011111111000) >>  3,
        ARG2 = (PROM[REG[1]] & 0b00000000000111);

    runOPCode(OP, ARG1, ARG2);

    if ((OP == 2 && ARG2 == 5) || (OP == 5 && ARG2 == 5))
        document.getElementById("reg" + 5).innerHTML = toByte(REG[5]);

    REG[1]++;
}

function toByte(number) {
    return parseInt(number).toString(16).padStart(2, "0").toUpperCase();
}
function fromByte(string) {
    return parseInt(string, 16);
}

function display() {

    for (let i in GREG)
        if (document.getElementById("greg" + i).innerHTML != fromByte(GREG[i]))
            document.getElementById("greg" + i).innerHTML = toByte(GREG[i]);
    
    for (let i in SREG)
        if (document.getElementById("sreg" + i).innerHTML != fromByte(SREG[i]))
            document.getElementById("sreg" + i).innerHTML = toByte(SREG[i]);
    
    if (document.getElementById("SREGi").innerHTML != fromByte(SREGi))
        document.getElementById("SREGi").innerHTML = toByte(SREGi);
    
    for (let i in REG)
        if (i > 0 && i < 7 && i != 5)
            document.getElementById("reg" + i).innerHTML = toByte(REG[i]);
}

function init() {

    for (let i in GREG)
        eGREG.innerHTML += "<div class=\"byte\" id=\"greg" + i + "\">" + toByte(GREG[i]) + (i % 16 == 15 ? "</div><br>" : "");
    
    for (let i in SREG)
        eSREG.innerHTML += "<div class=\"byte\" id=\"sreg" + i + "\">" + toByte(SREG[i]) + (i % 16 == 15 ? "</div><br>" : "");
    
    document.getElementById("SREGi").innerHTML = toByte(SREGi);
    
    for (let i in REG)
        if (i > 0 && i < 7)
            CPU.innerHTML += indexs.REG[i] + " : <div class=\"byte\" id=\"reg" + i + "\">" + toByte(REG[i]) + "</div><br>";
    
    display();
}
init();
