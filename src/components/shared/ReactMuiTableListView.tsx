import { useState, useCallback, memo } from 'react'
import { Table, Input, Button, Pagination } from '@/components/ui'
import { Card } from '@/components/ui'
import { HiViewGrid, HiViewList } from 'react-icons/hi'
import { motion } from 'framer-motion'
import type { DoctorProfile } from '@/services/DoctorService'

interface Column<T = any> {
    Header: string
    accessor: keyof T
    Cell?: (props: { value: T[keyof T]; row: T }) => JSX.Element
}

interface ReactMuiTableListViewProps {
    tableTitle?: string
    columns: Column<DoctorProfile>[]
    data: DoctorProfile[]
    enablePagination?: boolean
    rowsPerPageOptions?: number[]
    initialPageSize?: number
    onPageChange?: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
    totalItems?: number
    currentPage?: number
    pageSize?: number
    loading?: boolean
    viewTypeProp?: 'table' | 'card'
    searchTerm?: string
    onSearchChange?: (value: string) => void
}

const ReactMuiTableListView = memo(
    ({
        tableTitle,
        columns,
        data = [],
        enablePagination = true,
        rowsPerPageOptions = [5, 10, 15],
        initialPageSize = 10,
        onPageChange,
        onPageSizeChange,
        totalItems = 0,
        currentPage = 1,
        pageSize = initialPageSize,
        loading = false,
        viewTypeProp = 'table',
        searchTerm = '',
        onSearchChange,
    }: ReactMuiTableListViewProps) => {
        const [viewType, setViewType] = useState(viewTypeProp)

        const handlePageChange = useCallback(
            (page: number) => {
                onPageChange?.(page)
            },
            [onPageChange],
        )

        const handlePageSizeChange = useCallback(
            (newPageSize: number) => {
                onPageSizeChange?.(newPageSize)
            },
            [onPageSizeChange],
        )

        const handleSearchChange = useCallback(
            (value: string) => {
                onSearchChange?.(value)
            },
            [onSearchChange],
        )

        const toggleViewType = useCallback(() => {
            setViewType((prev) => (prev === 'table' ? 'card' : 'table'))
        }, [])

        const renderTable = useCallback(
            () => (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Table hoverable className="table-fixed w-full">
                        <thead>
                            <tr>
                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className="text-center align-middle px-4 py-3"
                                        style={{
                                            width:
                                                column.accessor === 'fullName'
                                                    ? '50%'
                                                    : column.accessor ===
                                                        'isOnline'
                                                      ? '25%'
                                                      : '25%',
                                            verticalAlign: 'middle',
                                        }}
                                    >
                                        <div className="w-full text-center">
                                            {column.Header}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className="text-center px-4 py-2 align-middle"
                                            style={{
                                                width:
                                                    column.accessor ===
                                                    'fullName'
                                                        ? '50%'
                                                        : column.accessor ===
                                                            'isOnline'
                                                          ? '25%'
                                                          : '25%',
                                            }}
                                        >
                                            {column.Cell
                                                ? column.Cell({
                                                      value: row[
                                                          column.accessor
                                                      ],
                                                      row,
                                                  })
                                                : row[column.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </motion.div>
            ),
            [columns, data],
        )

        const renderCard = useCallback(
            () => (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map((row, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-md transition-shadow rounded-xl overflow-hidden">
                                <div className="flex flex-col p-4 gap-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={
                                                row.profilePhoto ||
                                                '/img/avatars/default-avatar.jpg'
                                            }
                                            alt={row.fullName}
                                            className="w-14 h-14 rounded-full object-cover"
                                        />
                                        <div>
                                            <h5 className="font-semibold text-lg">
                                                {row.fullName}
                                            </h5>
                                            <p className="text-sm text-gray-500">
                                                {
                                                    row.DoctorProfessional
                                                        ?.specialization
                                                }
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {row.DoctorProfessional
                                                    ?.yearsOfExperience ??
                                                    0}{' '}
                                                years experience
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div>
                                            {columns
                                                .find(
                                                    (c) =>
                                                        c.accessor ===
                                                        'isOnline',
                                                )
                                                ?.Cell?.({
                                                    value: row['isOnline'],
                                                    row,
                                                })}
                                        </div>
                                        <div>
                                            {columns
                                                .find(
                                                    (c) => c.accessor === 'id',
                                                )
                                                ?.Cell?.({
                                                    value: row['id'],
                                                    row,
                                                })}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ),
            [columns, data],
        )

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    {onSearchChange && (
                        <div className="w-64">
                            <Input
                                prefix={
                                    <span className="text-lg icon-search" />
                                }
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                            />
                        </div>
                    )}
                    <Button
                        icon={
                            viewType === 'table' ? (
                                <HiViewGrid />
                            ) : (
                                <HiViewList />
                            )
                        }
                        onClick={toggleViewType}
                    >
                        {viewType === 'table' ? 'Card View' : 'Table View'}
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                        <div className="animate-spin">
                            <span className="text-2xl icon-loading" />
                        </div>
                    </div>
                ) : data.length === 0 ? (
                    <Card className="text-center py-8">
                        <h6>No data found</h6>
                    </Card>
                ) : viewType === 'table' ? (
                    renderTable()
                ) : (
                    renderCard()
                )}

                {enablePagination && totalItems > 0 && (
                    <div className="flex justify-between items-center">
                        <select
                            className="form-select"
                            value={pageSize}
                            onChange={(e) =>
                                handlePageSizeChange(Number(e.target.value))
                            }
                        >
                            {rowsPerPageOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size} per page
                                </option>
                            ))}
                        </select>
                        <Pagination
                            currentPage={currentPage}
                            total={Math.ceil(totalItems / pageSize)}
                            onChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        )
    },
)

ReactMuiTableListView.displayName = 'ReactMuiTableListView'

export default ReactMuiTableListView
