import {Entity, ObjectIdColumn, ObjectID, Column, BaseEntity, BeforeInsert } from "typeorm";
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

    @Column()
    forgotPasswordLocked: boolean;

    // @BeforeUpdate()
    // async hashPasswordBeforeUpdate() {
    //   if(this.password) {
    //     this.password = await bcrypt.hash(this.password, 10)
    //   }
    // }

    @BeforeInsert()
    async hashPasswordBeforeInsert() {
      this.password = await bcrypt.hash(this.password, 10)
      this.forgotPasswordLocked = false
    }


}
