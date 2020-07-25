// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class DefaultMap<K, V> extends Map<K, V> {

	public constructor(public defaultValue: V) {
		super();
	}

	public get(key: K): V {
		return super.get(key) ?? this.defaultValue;
	}

}
