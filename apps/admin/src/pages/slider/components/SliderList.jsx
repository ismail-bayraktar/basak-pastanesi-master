import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SliderCard } from "./SliderCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { sliderAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function SliderList({
  sliders,
  loading,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  onReorder,
}) {
  const { toast } = useToast()
  const [items, setItems] = useState(sliders)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item._id === active.id)
      const newIndex = items.findIndex((item) => item._id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)

      // Update order in backend
      try {
        const orderedSliders = newItems.map((item, index) => ({
          id: item._id,
          order: index,
        }))

        // Update each slider's order
        await Promise.all(
          orderedSliders.map(({ id, order }) => {
            const formData = new FormData()
            formData.append("order", order)
            return sliderAPI.update(id, formData)
          })
        )

        toast({
          title: "Başarılı!",
          description: "Slider sıralaması güncellendi",
        })
        onReorder()
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Sıralama güncellenirken hata oluştu",
        })
        setItems(sliders) // Rollback on error
      }
    }
  }

  // Update items when sliders prop changes
  if (items.length !== sliders.length || items[0]?._id !== sliders[0]?._id) {
    setItems(sliders)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    )
  }

  if (sliders.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Henüz slider eklenmemiş. "Yeni Slider" butonuna tıklayarak ilk
          slider'ınızı oluşturun.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((s) => s._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.map((slider, index) => (
            <SliderCard
              key={slider._id}
              slider={slider}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
