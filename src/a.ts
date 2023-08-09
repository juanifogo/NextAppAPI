
// variable a is equal to true if the type of variable b is string or undefined 

const b = "a"
const a = (typeof b === 'string') || (typeof b === 'undefined')
console.log(a)