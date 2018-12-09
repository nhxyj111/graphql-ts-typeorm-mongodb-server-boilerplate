import {Entity, ObjectIdColumn, ObjectID, Column, BaseEntity} from "typeorm";

@Entity('users')
export class User extends BaseEntity {

    @ObjectIdColumn()
    id: ObjectID;

    @Column({ length: 255 })
    email: string;

    @Column()
    password: string;

    @Column()
    confirmed: boolean;

}
