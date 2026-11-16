import Decimal from "break_eternity.js";
import { milestone, player, repeatableupgradebutbetterlmao } from "../player";
import { requirelessinfinity } from "./infinity";
import { reactive } from "vue";
import { formatNumber } from "../format";

export function delusionality() {
    requirelessinfinity()
}

export function enterdelusion() {
    const del = player.infinity.del

    if (!del.inDel) {
        del.inDel = true
        del.bestPoints = player.maincurrencies.Points
        delusionality()
        return
    }
    const gained = ppgain()

    del.PPoints = del.PPoints.add(gained)
    del.inDel = false
    del.bestPoints = new Decimal(0)
}
export function updateBestPoints() {
    const del = player.infinity.del

    if (
        del.inDel &&
        player.maincurrencies.Points.gt(del.bestPoints)
    ) {
        del.bestPoints = player.maincurrencies.Points
    }
}


export function ppgain() {
    const del = player.infinity.del
    if (!del.inDel) return new Decimal(0)

    let gain = player.maincurrencies.Points

    if (delRepeats[0].amountbought.gte(1)) {
        gain = gain.mul(delRepeats[0].effect())
    }

    return gain
}
export const delRepeats = reactive<repeatableupgradebutbetterlmao[]>([ 
    {
        id: "0",
        title: "A deluded future",
        description: "x1.2 psuedo points per upgrade bought",
        amountbought: new Decimal("0"),
        basecost: new Decimal("1000"),
        cost() {
        let scale = this.basecost.mul(
        Decimal.pow(2, this.amountbought)
        )
        if(this.amountbought.gte(75)) scale = this.basecost.mul(
        Decimal.pow(2.2, this.amountbought)
        )
        return scale
        },
        effect() {
      return Decimal.pow(1.2, this.amountbought.toNumber())
        },
        effectDisplay() {
      return "Currently x" + formatNumber(this.effect())
        },
        unlocked() { return true}
},
    {
        id: "1",
        title: "Faded support",
        description: "While in delusional, x10 points.",
        amountbought: new Decimal("0"),
        basecost: new Decimal("2500"),
        cost() {
        let scale = this.basecost.mul(
        Decimal.pow(10, this.amountbought)
        )
        if(this.amountbought.gte(10)) scale = this.basecost.mul(
        Decimal.pow(25, this.amountbought)
        )
        return scale
        },
        effect() {
      return Decimal.pow(10, this.amountbought.toNumber())
        },
        effectDisplay() {
      return "Currently x" + formatNumber(this.effect())
        },
        unlocked() { return true}
},
])

export function buyDelupgrade(id: string) {

  const upgrade = delRepeats.find(upg => upg.id === id)

  if (!upgrade) return

  const cost = upgrade.cost()

  if (player.infinity.del.PPoints.lt(cost)) return

  player.infinity.del.PPoints = player.infinity.del.PPoints.sub(cost)
  upgrade.amountbought = upgrade.amountbought.add(1)
}
