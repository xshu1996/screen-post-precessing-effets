import { Heap } from "../Heap/Heap";
import { IGetCompareValue, MaxHeap } from "../Heap/MaxHeap";

const getMaxCompare = (getCompareValue) => (a, b) =>
{
    const aVal = typeof getCompareValue === 'function' ? getCompareValue(a) : a;
    const bVal = typeof getCompareValue === 'function' ? getCompareValue(b) : b;
    return aVal < bVal ? 1 : -1;
};

/**
 * @class MaxPriorityQueue
 * @extends MaxHeap
 */
export class MaxPriorityQueue<T>
{
    private _heap: MaxHeap<T> = null;

    constructor(getCompareValue?: IGetCompareValue<T>, _heap?: MaxHeap<T>)
    {
        if (getCompareValue && typeof getCompareValue !== 'function')
        {
            throw new Error('MaxPriorityQueue constructor requires a callback for object values');
        }
        this._heap = _heap || new MaxHeap(getCompareValue);
    }

    /**
     * Returns an element with highest priority in the queue
     * @public
     * @returns {number|string|object}
     */
     public front(): T
    {
        return this._heap.root();
    }

    /**
     * Returns an element with lowest priority in the queue
     * @public
     * @returns {number|string|object}
     */
    public back(): T
    {
        return this._heap.leaf();
    }

    /**
     * Adds a value to the queue
     * @public
     * @param {number|string|object} value
     * @returns {MaxPriorityQueue}
     */
    public enqueue(value: T): MaxPriorityQueue<T>
    {
        this._heap.insert(value);
        return this;
    }

    /**
     * Removes and returns an element with highest priority in the queue
     * @public
     * @returns {number|string|object}
     */
    public dequeue(): T
    {
        return this._heap.extractRoot();
    }

    /**
     * Returns the number of elements in the queue
     * @public
     * @returns {number}
     */
    public size(): number
    {
        return this._heap.size();
    }

    /**
     * Checks if the queue is empty
     * @public
     * @returns {boolean}
     */
    public isEmpty(): boolean
    {
        return this._heap.isEmpty();
    }

    /**
     * Clears the queue
     * @public
     */
    public clear(): void
    {
        this._heap.clear();
    }

    /**
     * Returns a sorted list of elements from highest to lowest priority
     * @public
     * @returns {array}
     */
    public toArray(): T[]
    {
        return this._heap.clone().sort().reverse();
    }

    /**
     * Creates a priority queue from an existing array
     * @public
     * @static
     * @returns {MaxPriorityQueue}
     */
    public static fromArray<T>(values: T[], getCompareValue?: IGetCompareValue<T>): MaxPriorityQueue<T>
    {
        const heap = new Heap(getMaxCompare(getCompareValue), values);
        return new MaxPriorityQueue(
            getCompareValue,
            new MaxHeap(getCompareValue, heap).fix()
        );
    }
}

