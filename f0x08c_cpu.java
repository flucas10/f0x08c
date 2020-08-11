public class f0x08_cpu {
    
    public static int[] ROM = new int[256];
    
    private static int[] REG  = new int[6];
    private static int[] GREG = new int[256];
    private static int[] SREG = new int[256];
    private static int  SREGi = 0;
    private static boolean[] FLAGS = new boolean[3];
    
    private static int ALU(boolean UF, int SF, int OP) {
    
        int result = 0;
        
        if (SF > 0) {
            FLAGS[ SF & 0b001] = UF;
            FLAGS[(SF & 0b010 >> 1)] = UF;
            FLAGS[(SF & 0b100 >> 2)] = UF;
        }
        
        if (OP == 1) { // A
            result = REG[2];
        }
        else if (OP == 2) { // B
            result = REG[3];
        }
        else if (OP == 3) { // NOT A
            result = REG[2] ^ 0xFF;
        }
        else if (OP == 4) { // NOT B
            result = REG[3] ^ 0xFF;
        }
        else if (OP == 5) { // A OR B
            result = REG[2] | REG[3];
        }
        else if (OP == 6) { // A AND B
            result = REG[2] & REG[3];
        }
        else if (OP == 7) { // A XOR B
            result = REG[2] ^ REG[3];
        }
        else if (OP == 8) {  // A ADD B
            result = REG[2] + REG[3];
        }
        else if (OP == 9) { // A SUB B
            result = REG[2] - REG[3];
        }
        else if (OP == 10) {  // A ADC B
            result = REG[2] + REG[3] + 1;
        }
        else if (OP == 11) { // A SBC B
            result = REG[2] - REG[3] - 1;
        }
        else if (OP == 12) {  // INC A
            result = REG[2] + 1;
        }
        else if (OP == 13) { // INC B
            result = REG[3] + 1;
        }
        else if (OP == 14) {  // DEC A
            result = REG[2] - 1;
        }
        else if (OP == 15) { // DEC B
            result = REG[3] - 1;
        }

        if (UF) {
            FLAGS[0] = result == 0;
            FLAGS[1] = (result & 1) == 1;
            
            if (OP > 7) {
                FLAGS[2] = result > 255 || result >= 0;
            }
            else {
                FLAGS[2] = false;
            }
        }

        return result & 255;
    }
    
    
    private static boolean TEST(int OP) {

            if (OP == 0)
                return true;

            /*
            1: == 0
            2: LSB
            3: Overflow
            4: != 0
            5: !LSB
            6: !Overflow
            */

            return OP < 4 ? FLAGS[OP - 1] : !FLAGS[OP - 4];
        }
        
    private static void runOPCode(int OP, int ARG1, int ARG2) {

        if (OP == 0) {
        }
        else if (OP == 1) { //LDI
            if (ARG2 > 0 && ARG2 < 7)
                REG[ARG2] = ARG1;
        }
        else if (OP == 2) { //ALU
            if (ARG2 > 0 && ARG2 < 7)
                REG[ARG2] = ALU((ARG1 >> 7) == 1, (ARG1 & 0b01110000) >> 3, ARG1 & 0b1111);
        }
        else if (OP == 3) { //JMP
            if (TEST(ARG1 >> 5))
                REG[1] = ((ARG1 & 0b11111) << 3 | ARG2) - 1;
        }
        else if (OP == 4) { //PUSH
            if ((ARG1 >> 7) == 1) {
                SREG[SREGi] = GREG[REG[4]];
                SREGi++;
            }
            else if (ARG2 > 0 && ARG2 < 7) {
                SREG[SREGi] = REG[ARG2];
                SREGi++;
            }
        }
        else if (OP == 5) { //POP
            if ((ARG1 >> 7) == 1) {
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
            for (byte i = 1; i < 6; i++) {
                SREG[SREGi] = REG[i];
                REG[i] = 0;
                SREGi++;
            }
            REG[1] = ARG1 - 1;
        }
        else if (OP == 7) { //RET
            for (byte i = 5; i > 0 ; i--) {
                SREGi--;
                REG[i] = SREG[SREGi];
                SREG[SREGi] = 0;
            }
        }
    }
    
    public static void main(String[] args) {
    
        int[] program = {
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
            Fibonacci
            0b00100000001010, //  0 LDI  0x01  ACa  ->   0: A = 1;
            0b01010001000010, //  1 ALU  0x08  ACa  ->   1: A += B;
            0b01000001001011, //  2 ALU  0x09  ACb  ->   2: B = A-B;
            0b01000000010101, //  3 ALU  0x02  IOo  ->   3: OUT = B;
            0b01111000000001, //  4 JMP  0x06 0x01  ->   4: GOTO 1 if not overlow_flag;
            */
        };
        for (int i = 0; i < program.length; i++) {
            ROM[i] = program[i];
        }
        
    
        for (; ; REG[1] = REG[1] + 1 & 255) {
            int OP   = (ROM[REG[1]] & 0b11100000000000) >> 11;
            int ARG1 = (ROM[REG[1]] & 0b00011111111000) >>  3;
            int ARG2 = (ROM[REG[1]] & 0b00000000000111);

            runOPCode(OP, ARG1, ARG2);

            if ((OP == 2 && ARG2 == 5) || (OP == 5 && ARG2 == 5))
                System.out.println(REG[5]);
        }
    }
}
