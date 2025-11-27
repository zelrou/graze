type OrNull<Type> = Type | null;
type OneOrMany<Type> = Type | Type[];
type OneOrManyOrNull<Type> = OrNull<OneOrMany<Type>>;
//type OneOrManyOrNull<Type> = OneOrMany<Type> | null
type OneOrManyOrNullStrings = OneOrManyOrNull<string>;

type Integer = number
const isInt = (x:any):x is Integer => Number.isInteger(x)
type CoordTuple = [ Integer, Integer, Integer ]

enum CoordTupleKeys { sIdx, pIdx, cIdx }
type CoordTupleKey = keyof typeof CoordTupleKeys

enum CoordKeys {sIdx="sIdx", pIdx="pIdx", cIdx="cIdx"}
type CoordDict = Record<CoordKeys, Integer>



type LocationConstructorFirstArg = number|CoordTuple|CoordDict

interface LocationConstructor {
    new(firstArg:LocationConstructorFirstArg, secondArg:number|null, thirdArg:number|null):any
}
interface LocationInterface extends CoordDict{
    toCoordArray():number[];
}

const Loc:LocationConstructor = class Location implements LocationInterface {
    static coordKeys:readonly string[] = Object
        .freeze('sIdx,pIdx,cIdx'.split(','))
    static shape:number = this.coordKeys.length

    static hasEveryCoordKey = (obj:object):boolean => this.coordKeys
        .every(k => Reflect.has(obj,k))

    static isCoordArray = (arr:any):arr is CoordTuple => {
        if (!Array.isArray(arr) || (arr.length !== this.shape)) return false
        return arr.every(Number.isInteger)
    }

    private _coords:CoordTuple;

    get sIdx():Integer { return this._coords[CoordTupleKeys.sIdx] }
    get pIdx():Integer { return this._coords[CoordTupleKeys.pIdx] }
    get cIdx():Integer { return this._coords[CoordTupleKeys.cIdx] }

    constructor(
        firstArg:LocationConstructorFirstArg,
        pIdx:OrNull<Integer> = null,
        cIdx:OrNull<Integer> = null
    ) {
        if (arguments.length>Location.shape) throw new TypeError()

        if (arguments.length === Location.shape) {
            if (!Location.isCoordArray(arguments)) throw new TypeError()
            this._coords = [arguments[0], arguments[1], arguments[2]]
            return this
        }

        if (Location.isCoordArray(firstArg)) {
            this._coords = [firstArg[0], firstArg[1], firstArg[2]]
            return this
        }

        if (typeof firstArg !== 'object') throw new TypeError()
        if (firstArg === null) throw new TypeError()
        if (!Location.hasEveryCoordKey(firstArg)) throw new TypeError()

        this._coords = [ firstArg.sIdx, firstArg.pIdx, firstArg.cIdx ]
        return this
    }

    toCoordArray = () => Array.from(this._coords)
}

export default Loc

