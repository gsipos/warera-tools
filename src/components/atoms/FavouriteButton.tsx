import { FavouriteType, useFavouriteState } from '@/hooks/use-favourite-state'
import { Button } from '../ui/button'
import { HeartIcon } from 'lucide-react'
import { SimpleTooltip } from '../ui/tooltip'

interface Props {
  type: FavouriteType
  id: string
}

export const FavouriteButton = (props: Props) => {
  const favouriteState = useFavouriteState()

  const isFavourite = favouriteState.isFavourite(props.id)

  const toggleFavourite = () => {
    if (isFavourite) {
      favouriteState.removeFavourite(props.id)
    } else {
      favouriteState.addFavourite({ type: props.type, id: props.id })
    }
  }

  return (
    <SimpleTooltip tooltip="Favourite">
      <Button variant={isFavourite ? 'default' : 'ghost'} size="icon-sm" onClick={toggleFavourite}>
        <HeartIcon />
      </Button>
    </SimpleTooltip>
  )
}
