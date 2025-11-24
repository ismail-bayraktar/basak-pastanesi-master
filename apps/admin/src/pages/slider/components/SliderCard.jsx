import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GripVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react"

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4001'

export function SliderCard({ slider, index, onEdit, onDelete, onDuplicate, onToggleActive }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: slider._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getTemplateBadge = (template) => {
    const badges = {
      "split-left": { label: "Sola Hizalı", variant: "default" },
      "split-right": { label: "Sağa Hizalı", variant: "secondary" },
      centered: { label: "Ortalanmış", variant: "outline" },
      overlay: { label: "Overlay", variant: "destructive" },
      "full-width": { label: "Tam Genişlik", variant: "default" },
    }
    const config = badges[template] || badges["split-left"]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="flex items-center cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
              <span className="ml-2 text-sm font-semibold text-muted-foreground">
                #{index + 1}
              </span>
            </div>

            {/* Thumbnail */}
            <div className="w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
              {slider.image ? (
                <img
                  src={slider.image.startsWith('http') ? slider.image : `${backendUrl}${slider.image}`}
                  alt={slider.altText || slider.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  No Image
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{slider.title}</h3>
                  <p className="text-sm text-muted-foreground">{slider.subtitle}</p>
                </div>
                <div className="flex gap-2">
                  {getTemplateBadge(slider.template)}
                  <Badge variant={slider.isActive ? "default" : "secondary"}>
                    {slider.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {slider.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {slider.buttonLink && (
                  <div className="flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    {slider.buttonLink}
                  </div>
                )}
                {slider.viewCount !== undefined && (
                  <span>👁️ {slider.viewCount} görüntülenme</span>
                )}
                {slider.clickCount !== undefined && (
                  <span>🖱️ {slider.clickCount} tıklama</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(slider)}
                title="Düzenle"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(slider)}
                title="Kopyala"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleActive(slider)}
                title={slider.isActive ? "Pasif Yap" : "Aktif Yap"}
              >
                {slider.isActive ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(slider._id)}
                title="Sil"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
