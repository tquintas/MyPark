export class User {
    id;
    email;
    password;
    name;
    address;
    type;
    constructor(id, email, password, name, address, type) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
        this.address = address;
        this.type = type;
    }
}
;
