import type { MarketReport as AaveMarketReport } from '../../protocols/aave/report/types'
import type { MaplePoolReport } from '../../protocols/maple/report/types'
import type { MarketReport as MorphoMarketReport } from '../../protocols/morpho/report/types'
import type { MarketReport as SparkMarketReport } from '../../protocols/spark/report/types'

export type KnownReport = AaveMarketReport | SparkMarketReport | MorphoMarketReport | MaplePoolReport

export function isMapleReport(report: KnownReport): report is MaplePoolReport {
  return 'poolSymbol' in report
}

export function isMorphoReport(report: KnownReport): report is MorphoMarketReport {
  return !isMapleReport(report) && 'collateralAsset' in report.modifiers.collateralDependencyRobustness
}

export function isAaveReport(report: KnownReport): report is AaveMarketReport {
  return (
    !isMapleReport(report)
    && !isMorphoReport(report)
    && 'recentLiquidationVolume' in report.anchors.marketSolvency
  )
}

export function isSparkReport(report: KnownReport): report is SparkMarketReport {
  return !isMapleReport(report) && !isMorphoReport(report) && !isAaveReport(report)
}
