import { Card } from '@/components/ui'
import { HiUsers, HiHeart, HiUserGroup, HiTrendingUp } from 'react-icons/hi'
import type { FamilyStatistics } from '@/services/FamilyService'

type FamilyStatisticsCardProps = {
    statistics: FamilyStatistics | null
    loading: boolean
}

const FamilyStatisticsCard = ({ statistics, loading }: FamilyStatisticsCardProps) => {
    if (loading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="text-center">
                                <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        )
    }

    if (!statistics) {
        return null
    }

    return (
        <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <HiTrendingUp className="w-5 h-5 mr-2" />
                Family Overview
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <HiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.totalMembers}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Members</div>
                </div>
                
                <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <HiHeart className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.emergencyContactsCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Emergency Contacts</div>
                </div>
                
                <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <HiUserGroup className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.relationshipBreakdown.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Relationships</div>
                </div>
                
                <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <HiTrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.ageGroupBreakdown.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Age Groups</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Relationship Breakdown */}
                <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">By Relationship</h4>
                    <div className="space-y-2">
                        {statistics.relationshipBreakdown.map((item) => (
                            <div key={item.relationship} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{item.relationship}</span>
                                <span className="font-medium text-gray-900 dark:text-white">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Age Group Breakdown */}
                <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">By Age Group</h4>
                    <div className="space-y-2">
                        {statistics.ageGroupBreakdown.map((item) => (
                            <div key={item.ageGroup} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{item.ageGroup}</span>
                                <span className="font-medium text-gray-900 dark:text-white">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {new Date(statistics.generatedAt).toLocaleString()}
                </p>
            </div>
        </Card>
    )
}

export default FamilyStatisticsCard 