class Snowflake {
  private static readonly EPOCH = 1704067200000n // 2024-01-01 00:00:00 UTC
  private static readonly WORKER_ID_BITS = 5n
  private static readonly DATACENTER_ID_BITS = 5n
  private static readonly SEQUENCE_BITS = 12n

  private static readonly MAX_WORKER_ID = -1n ^ (-1n << Snowflake.WORKER_ID_BITS)
  private static readonly MAX_DATACENTER_ID = -1n ^ (-1n << Snowflake.DATACENTER_ID_BITS)

  private static readonly WORKER_ID_SHIFT = Snowflake.SEQUENCE_BITS
  private static readonly DATACENTER_ID_SHIFT = Snowflake.SEQUENCE_BITS + Snowflake.WORKER_ID_BITS
  private static readonly TIMESTAMP_LEFT_SHIFT = Snowflake.SEQUENCE_BITS + Snowflake.WORKER_ID_BITS + Snowflake.DATACENTER_ID_BITS
  private static readonly SEQUENCE_MASK = -1n ^ (-1n << Snowflake.SEQUENCE_BITS)

  private workerId: bigint
  private datacenterId: bigint
  private sequence: bigint = 0n
  private lastTimestamp: bigint = -1n

  constructor(workerId: number = 1, datacenterId: number = 1) {
    if (BigInt(workerId) > Snowflake.MAX_WORKER_ID || workerId < 0) {
      throw new Error(`Worker ID can't be greater than ${Snowflake.MAX_WORKER_ID} or less than 0`)
    }
    if (BigInt(datacenterId) > Snowflake.MAX_DATACENTER_ID || datacenterId < 0) {
      throw new Error(`Datacenter ID can't be greater than ${Snowflake.MAX_DATACENTER_ID} or less than 0`)
    }
    this.workerId = BigInt(workerId)
    this.datacenterId = BigInt(datacenterId)
  }

  public nextId(): string {
    let timestamp = this.timeGen()

    if (timestamp < this.lastTimestamp) {
      throw new Error(`Clock moved backwards. Refusing to generate id for ${this.lastTimestamp - timestamp} milliseconds`)
    }

    if (this.lastTimestamp === timestamp) {
      this.sequence = (this.sequence + 1n) & Snowflake.SEQUENCE_MASK
      if (this.sequence === 0n) {
        timestamp = this.tilNextMillis(this.lastTimestamp)
      }
    } else {
      this.sequence = 0n
    }

    this.lastTimestamp = timestamp

    const id = ((timestamp - Snowflake.EPOCH) << Snowflake.TIMESTAMP_LEFT_SHIFT) |
      (this.datacenterId << Snowflake.DATACENTER_ID_SHIFT) |
      (this.workerId << Snowflake.WORKER_ID_SHIFT) |
      this.sequence

    return id.toString()
  }

  private tilNextMillis(lastTimestamp: bigint): bigint {
    let timestamp = this.timeGen()
    while (timestamp <= lastTimestamp) {
      timestamp = this.timeGen()
    }
    return timestamp
  }

  private timeGen(): bigint {
    return BigInt(Date.now())
  }
}

// Global instance
const snowflake = new Snowflake(1, 1)

export const generateId = () => snowflake.nextId()
