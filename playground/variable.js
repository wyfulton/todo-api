var person = {
	name: "Will",
	age: 21
}

function updatePerson (obj) {
	// obj = {
	// 	name: "Will",
	// 	age: 29
	// };

	obj.age = 29;
}

var array = [12, 90];


function updateArray2 (arr) {
	arr.push(55);
}

updateArray(array);

console.log(array)

updateArray2(array);

console.log(array)

