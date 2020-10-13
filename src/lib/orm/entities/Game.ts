import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'games' })
export default class GameEntity {

	@PrimaryGeneratedColumn()
	public id!: number;

	@Column('varchar', { length: 50, nullable: false })
	public setupName!: string;

	@Column('varchar', { length: 30, nullable: true })
	public winningFaction?: string;

	@Column('varchar', { 'length': 30, 'array': true, 'default': () => 'ARRAY[]::VARCHAR[]' })
	public independentWins: string[] = [];

	@Column('varchar', { length: '19', nullable: false })
	public guildID!: string;

}
