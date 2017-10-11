function  people(name) {
    this.name=name;
    this.intro=function(){
        console.log('my name is'+this.name);
    }
}

people.Run=function () {
    console.log('I can run')
}

people.prototype.introP=function () {
    console.log('my prototype name is:'+this.name)
}

var p1=new people('P1');
p1.intro();

people.Run();

p1.introP();
// people.intro();
console.log(p1.name)