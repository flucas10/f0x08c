// f0x08c redstone processor emuletor.

#include <iostream>

#define PC    REG[1]
#define ACa   REG[2]
#define ACb   REG[3]
#define GREGA REG[4]
#define IOo   REG[5]
//#define IOi REG[6]

using namespace std;

__uint16_t* ROM = new __uint16_t[256]{
    0b00100000001010,
    0b00100000001011,
    0b10000000000010,
    0b10110000000000,
    0b11000001010000,
    0b01010001000010,
    0b10000000000010,
    0b10100000000011,
    0b01110000000010,
    0b01100000001111,
    0b10010000000000,
    0b10100000000010,
    0b01000000001101,
    0b11100000000000,
/*
    0b00100000001010, //  0 LDI  0x01  ACa  ->   0: A = 1;
    0b01010001000010, //  1 ALU  0x08  ACa  ->   1: A += B;
    0b01000001001011, //  2 ALU  0x09  ACb  ->   2: B = A-B;
    0b01000000010101, //  3 ALU  0x02  IOo  ->   3: OUT = B;
    0b01111000000001, //  4 JMP  0x06 0x01  ->   4: GOTO 1 if not overlow_flag;
    */
};
__uint8_t*  REG = new __uint8_t[6];   // Registers
__uint8_t* GREG = new __uint8_t[256]; // Global Registers
__uint8_t* SREG = new __uint8_t[256]; // Stack Register
__uint8_t SREGi = 0;                  // Stack Pointer Register
bool*     FLAGS = new bool[3];        // Flag Registers

__uint8_t ALU(bool UF=0, __uint8_t SF=0, __uint8_t OP=0) {
    
     __uint8_t result;

     
    if (SF > 0) {
        FLAGS[ SF & 0b001] = UF;
        FLAGS[(SF & 0b010 >> 1)] = UF;
        FLAGS[(SF & 0b100 >> 2)] = UF;
    }
     
    if (OP == 1) { // A
        result = ACa;

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
        }
    }
    else if (OP == 2) { // B
        result = ACb;

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
        }
    }
    else if (OP == 3) { // NOT A
        result = ACa ^ 0xFF;

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
        }
    }
    else if (OP == 4) { // NOT B
        result = ACb ^ 0xFF;

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
        }
    }
    else if (OP == 5) { // A OR B
        result = ACa | ACb;

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
        }
    }
    else if (OP == 6) { // A AND B
        result = ACa & ACb;

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
        }
    }
    else if (OP == 7) { // A XOR B
        result = ACa ^ ACb;

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = result & 1;
        }
    }
    else if (OP == 8) {  // A ADD B
        __uint16_t resultS = (__uint16_t) ACa + (__uint16_t) ACb;

        if (UF) {
            FLAGS[0] = resultS == 0;
            FLAGS[1] = resultS & 1;
            FLAGS[2] = resultS > 255;
        }

        return (__uint8_t) resultS;
    }
    else if (OP == 9) { // A SUB B
        __int16_t resultS = (__int16_t) ACa - (__int16_t) ACb;

        if (UF) {
            FLAGS[0] = resultS == 0;
            FLAGS[1] = resultS & 1;
            FLAGS[2] = resultS >= 0;
        }

        return (__uint8_t) resultS - 256;
    }
    else if (OP == 10) {  // A ADC B
        __uint16_t resultS = (__uint16_t) ACa + (__uint16_t) ACb + 1;

        if (UF) {
            FLAGS[0] = resultS == 0;
            FLAGS[1] = resultS & 1;
            FLAGS[2] = resultS > 255;
        }

        return (__uint8_t) resultS;
    }
    else if (OP == 11) { // A SBC B
        __int16_t resultS = (__int16_t) ACa - (__int16_t) ACb - 1;

        if (UF) {
            FLAGS[0] = resultS == 0;
            FLAGS[1] = resultS & 1;
            FLAGS[2] = resultS >= 0;
        }

        return (__uint8_t) resultS - 256;
    }
    else if (OP == 12) {  // INC A
        __uint16_t resultS = (__uint16_t) ACa + 1;

        if (UF) {
            FLAGS[0] = resultS == 0;
            FLAGS[1] = resultS & 1;
            FLAGS[2] = resultS > 255;
        }

        return (__uint8_t) resultS;
    }
    else if (OP == 13) { // INC B
        __int16_t resultS = (__int16_t) ACb + 1;

        if (UF) {
            FLAGS[0] = resultS == 0;
            FLAGS[1] = resultS & 1;
            FLAGS[2] = resultS >= 0;
        }

        return (__uint8_t) resultS - 256;
    }
    else if (OP == 14) {  // DEC A
        __uint16_t resultS = (__uint16_t) ACa - 1;

        if (UF) {
            FLAGS[0] = resultS == 0;
            FLAGS[1] = resultS & 1;
            FLAGS[2] = resultS > 255;
        }

        return (__uint8_t) resultS;
    }
    else if (OP == 15) { // DEC B
        __int16_t resultS = (__int16_t) ACb - 1;

        if (UF) {
            FLAGS[0] = resultS == 0;
            FLAGS[1] = resultS & 1;
            FLAGS[2] = resultS >= 0;
        }

        return (__uint8_t) resultS - 256;
    }

    return result;
}

bool TEST(__uint8_t OP=0) {

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

void runOPCode(__uint8_t OP=0, __uint8_t ARG1=0, __uint8_t ARG2=0) {

    if (OP == 0) {
    }
    else if (OP == 1) { //LDI
        if (ARG2 > 0 && ARG2 < 7)
            REG[ARG2] = ARG1;
    }
    else if (OP == 2) { //ALU
        if (ARG2 > 0 && ARG2 < 7)
            REG[ARG2] = ALU(ARG1 >> 7, (ARG1 & 0b01110000) >> 3, ARG1 & 0b1111);
    }
    else if (OP == 3) { //JMP
        if (TEST(ARG1 >> 5))
            PC = ((ARG1 & 0b11111) << 3 | ARG2) - 1;
    }
    else if (OP == 4) { //PUSH
        if (ARG1 >> 7) {
            SREG[SREGi] = GREG[GREGA];
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
            GREG[GREGA] = SREG[SREGi];
            SREG[SREGi] = 0;
        }
        else if (ARG2 > 0 && ARG2 < 7) {
            SREGi--;
            REG[ARG2] = SREG[SREGi];
            SREG[SREGi] = 0;
        }
    }
    else if (OP == 6) { //CALL
        for (__uint8_t i = 1; i < 8; i++) {
            SREG[SREGi] = REG[i];
            REG[i] = 0;
            SREGi++;
        }
        PC = ARG1 - 1;
    }
    else if (OP == 7) { //RET
        for (__uint8_t i = 7; i > 0 ; i--) {
            SREGi--;
            REG[i] = SREG[SREGi];
            SREG[SREGi] = 0;
        }
    }
}

int main() {
    
    for (; ; PC++) {
        __uint8_t OP   = (ROM[PC] & 0b11100000000000) >> 11;
        __uint8_t ARG1 = (ROM[PC] & 0b00011111111000) >>  3;
        __uint8_t ARG2 = (ROM[PC] & 0b00000000000111);

        runOPCode(OP, ARG1, ARG2);

        if ((OP == 2 && ARG2 == 5) || (OP == 5 && ARG2 == 5))
            cout << (int) IOo << "\n";
    }

    return 0;
}
