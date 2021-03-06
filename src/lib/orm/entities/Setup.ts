import type { ISetup } from '@root/lib/mafia/structures/Setup';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'setups' })
export default class Setup implements ISetup {
	@PrimaryColumn('varchar')
	public name!: string;

	@Column('varchar', { array: true, nullable: false, default: () => 'ARRAY[]::VARCHAR[]' })
	public roles!: string[];

	@Column('boolean')
	public nightStart = false;
}
