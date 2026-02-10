import { ItemBackground } from '@/components/atoms/ItemBackground'
import { ItemImage } from '@/components/atoms/ItemImage'
import { ItemThumbnail } from '@/components/molecules/ItemThumbnail'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemTitle } from '@/components/ui/item'
import { moneyFormat } from '@/functions/number-formats'
import { useItemSellPrice } from '@/hooks/game/use-item-wage-report'
import { createFileRoute } from '@tanstack/react-router'
import { CircleQuestionMarkIcon, MinusCircleIcon, PlusCircleIcon } from 'lucide-react'
import { ReactNode, useState } from 'react'

export const Route = createFileRoute('/items/crafting')({
  component: RouteComponent,
})

const NumberInputWithButtons = ({ value, onChange }: { value: number; onChange: (newValue: number) => void }) => {
  const handleDecrement = () => {
    onChange(value - 1)
  }

  const handleIncrement = () => {
    onChange(value + 1)
  }

  return (
    <InputGroup className="w-36">
      <InputGroupInput type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />

      <InputGroupAddon align="inline-start">
        <InputGroupButton onClick={handleDecrement}>
          <MinusCircleIcon />
        </InputGroupButton>
      </InputGroupAddon>

      <InputGroupAddon align="inline-end">
        <InputGroupButton onClick={handleIncrement}>
          <PlusCircleIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

const ScrapRrice = () => {
  const scrapSellPrice = useItemSellPrice('scraps')
  return (
    <Item variant="outline">
      <ItemMedia variant="image">
        <ItemBackground level={3}>
          <ItemImage itemCode="scraps" className="size-8" />
        </ItemBackground>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Scraps</ItemTitle>
        <ItemDescription>{moneyFormat.format(scrapSellPrice)}</ItemDescription>
      </ItemContent>
    </Item>
  )
}

const SteelPrice = () => {
  const price = useItemSellPrice('steel')
  return (
    <Item variant="outline">
      <ItemMedia variant="image">
        <ItemBackground level={2}>
          <ItemImage itemCode="steel" className="size-8" />
        </ItemBackground>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Steel</ItemTitle>
        <ItemDescription>{moneyFormat.format(price)}</ItemDescription>
      </ItemContent>
    </Item>
  )
}

interface CraftCardProps {
  title: string
  icon: ReactNode

  scraps: number
  steel: number

  minPrices: number[]
  maxPrices: number[]
  avgPrices: number[]
}

const CraftCard = (props: CraftCardProps) => {
  const [amount, setAmount] = useState(0)
  return (
    <Card>
      <CardHeader>
        <Item>
          <ItemMedia variant="image">
            <ItemBackground code="tank" className="p-3 text-6xl">
              <CircleQuestionMarkIcon />
            </ItemBackground>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Random Mythic</ItemTitle>
          </ItemContent>
        </Item>
      </CardHeader>
      <CardContent>
        <div>
          
            
              <ItemBackground level={2}>
                <ItemImage itemCode="steel" className="size-2" />
              </ItemBackground>
            
            <ItemContent>
              <ItemTitle>10 Steel</ItemTitle>
            </ItemContent>
          </Item>
        </div>
      </CardContent>
      <CardFooter>
        <NumberInputWithButtons value={amount} onChange={setAmount} />
      </CardFooter>
    </Card>
  )
}

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 px-4">
      <h1 className="col-span-full mb-4 text-2xl font-bold">Crafting</h1>

      <div className="flex flex-row flex-wrap justify-start gap-4">
        <ScrapRrice />
        <SteelPrice />
      </div>

      <div className="flex flex-row flex-wrap justify-start gap-4">
        <CraftCard />
      </div>
    </div>
  )
}
