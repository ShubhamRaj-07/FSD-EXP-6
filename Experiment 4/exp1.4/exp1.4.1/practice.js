const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
let employee = [];
function menu(){
    console.log("1. Add Employee\n2.List Employee 3.Exit");
    rl.question("Choose",function(choice){
        if(choice==1) addemployee();
        else if(choice==2) listemployee();
        else rl.close();
    });

}
function addemployee(){
    rl.question("Name:",function(name){ //name:a
        rl.question("Position:",function(position){ //pos:b
            let emp ={
                name: name,
                position: position
            }
            employee.push(emp);
            console.log("Added:");
            menu();
        });
    });
}
function listemployee(){
    console.log(employee);
    menu();
}
menu();