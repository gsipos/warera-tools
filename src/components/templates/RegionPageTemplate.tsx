import { ExtendedRegion } from '@/hooks/game/use-extended-region'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { RegionCard } from '../organisms/RegionCard'
import { useState } from 'react'

const usePagination = <T extends unknown>(items: T[], itemsPerPage: number) => {
  const totalItems = items.length
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pages = Math.ceil(totalItems / itemsPerPage)

  const onPageChange = (page: number) => {
    setCurrentPage(Math.max(Math.min(page, pages), 1))
  }

  const shownItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return {
    currentPage,
    totalPages: pages,
    onPageChange,
    shownItems,
  }
}

const RegionPagination = (props: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => {
  const pages = [
    props.currentPage - 2,
    props.currentPage - 1,
    props.currentPage,
    props.currentPage + 1,
    props.currentPage + 2,
  ]
    .filter((p) => p > 0)
    .filter((p) => p <= props.totalPages)

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => props.onPageChange(props.currentPage - 1)} />
        </PaginationItem>

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink isActive={page === props.currentPage} onClick={() => props.onPageChange(page)}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext onClick={() => props.onPageChange(props.currentPage + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

interface Props {
  regions: ExtendedRegion[]
  pageTitle: string
}

export const RegionPageTemplate = (props: Props) => {
  const regions = props.regions

  const pagination = usePagination(regions, 20)

  return (
    <div className="grid grid-cols-4 gap-6 p-2">
      <div className="col-span-full grid grid-cols-4 items-center">
        <h1 className="col-span-full mb-4 text-2xl font-bold">{props.pageTitle}</h1>
      </div>
      <div className="col-span-full flex justify-end">
        <div></div>

        <RegionPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
        />
      </div>
      {pagination.shownItems.map((extRegion) => (
        <RegionCard
          region={extRegion.region}
          key={extRegion.region._id}
          companies={extRegion.companies}
          country={extRegion.country}
          initialCountry={extRegion.initialCountry}
        />
      ))}
    </div>
  )
}
