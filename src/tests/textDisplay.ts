import { text } from '../components/textDisplay';

console.log(text('wow').ordered().Content);
console.log(text('wow').ordered(3).Content);
console.log(text('wow', '', text('nooo').bold()).ordered(2).Content);

const x = text();
console.log(x.content(x).Content);
