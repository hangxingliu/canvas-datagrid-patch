import { MainClass } from "./main";

// test
const cls = new MainClass();
console.log(cls.getCells());
console.log(cls.editCell('10000'));
console.log(cls.getCells());
setTimeout(cls.editCell, 100, '20000');
setTimeout(cls.getCells, 200);
