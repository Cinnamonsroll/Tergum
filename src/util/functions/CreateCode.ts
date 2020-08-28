export default function CreateCode (length: number) {
    let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let i = 0;
    let code = "";
    do {
        const random = Math.floor(Math.random() * alphabet.length);
        const char = alphabet.charAt(random);
        code += char;
        i++;
    } while (i < length);
    return code;
}