import { useState, useCallback, memo } from 'react'
import { Table, Input, Button, Pagination } from '@/components/ui'
import { HiViewGrid, HiViewList } from 'react-icons/hi'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export interface Column<T extends Record<string, unknown>> {
    Header: string
    accessor: keyof T | ((row: T) => string | number | null | undefined)
    Cell?: (props: { value: unknown; row: { original: T } }) => ReactNode
}

export interface ReactMuiTableListViewProps<T extends Record<string, unknown>> {
    tableTitle?: string
    columns: Column<T>[]
    data: T[]
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
    cardTemplate?: (item: T) => ReactNode
    enableTableListview?: boolean
    enableCardView?: boolean
    enableSearch?: boolean
}

function ReactMuiTableListView<T extends Record<string, unknown>>({
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
    cardTemplate,
    enableTableListview = true,
    enableCardView = true,
    enableSearch = true,
}: ReactMuiTableListViewProps<T>) {
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

    const getCellValue = (row: T, column: Column<T>): unknown => {
        if (typeof column.accessor === 'function') {
            return column.accessor(row)
        }

        // Handle nested object paths (e.g., 'user.name', 'address.city')
        const path = (column.accessor as string).split('.')
        let value: unknown = row
        for (const key of path) {
            if (value === null || value === undefined) break
            value = (value as Record<string, unknown>)?.[key]
        }
        return value
    }

    const renderTableView = useCallback(
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
                                        width: '25%',
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
                                {columns.map((column, colIndex) => {
                                    const value = getCellValue(row, column)
                                    return (
                                        <td
                                            key={colIndex}
                                            className="text-center px-4 py-2 align-middle"
                                            style={{
                                                width: '25%',
                                            }}
                                        >
                                            {column.Cell
                                                ? column.Cell({
                                                      value,
                                                      row: { original: row },
                                                  })
                                                : value !== null &&
                                                    value !== undefined
                                                  ? String(value)
                                                  : ''}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center py-4"
                                >
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </motion.div>
        ),
        [columns, data],
    )

    const renderCardView = useCallback(
        () => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        {cardTemplate ? (
                            cardTemplate(item)
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                {columns.map((column, colIndex) => {
                                    const value = getCellValue(item, column)
                                    return (
                                        <div key={colIndex} className="mb-2">
                                            <div className="font-semibold">
                                                {column.Header}
                                            </div>
                                            <div>
                                                {column.Cell
                                                    ? column.Cell({
                                                          value,
                                                          row: {
                                                              original: item,
                                                          },
                                                      })
                                                    : value !== null &&
                                                        value !== undefined
                                                      ? String(value)
                                                      : ''}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>
                ))}
                {data.length === 0 && (
                    <div className="col-span-full text-center py-8 bg-white rounded-lg shadow-sm">
                        <h6>No data available</h6>
                    </div>
                )}
            </div>
        ),
        [data, cardTemplate, columns],
    )

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                {enableSearch && onSearchChange && (
                    <div className="w-64">
                        <Input
                            prefix={<span className="text-lg icon-search" />}
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                )}
                {enableTableListview && enableCardView && (
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
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <div className="animate-spin">
                        <span className="text-2xl icon-loading" />
                    </div>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                    <h6>No data found</h6>
                </div>
            ) : viewType === 'table' && enableTableListview ? (
                renderTableView()
            ) : enableCardView ? (
                renderCardView()
            ) : null}

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
}

ReactMuiTableListView.displayName = 'ReactMuiTableListView'

export default memo(ReactMuiTableListView) as typeof ReactMuiTableListView
