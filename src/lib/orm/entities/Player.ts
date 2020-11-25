import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'players' })
export default class PlayerEntity {

	@PrimaryGeneratedColumn()
	public id!: number;

	@Column('varchar', { length: 19, nullable: false })
	public userID!: string;

	@Column('varchar', { length: 30, nullable: false })
	public faction!: string;

	@Column('varchar', { length: 30, nullable: false })
	public roleName!: string;

	@Column('boolean', { nullable: false })
	public result!: boolean;

}
