import {Entity, ObjectIdColumn, ObjectID, Column, BaseEntity, BeforeInsert} from "typeorm";
import * as bcrypt from 'bcryptjs'

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

    @BeforeInsert()
    async hashPassword() {
      this.password = await bcrypt.hash(this.password, 10)
    }


}
