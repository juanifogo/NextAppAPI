function a(obj: any): boolean {
    console.log(typeof obj.a)
    return typeof obj.a === 'number'
}

const obj = {
    b: 1,
}

console.log(a(obj))