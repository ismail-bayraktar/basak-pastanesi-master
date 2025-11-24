import { useState } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    MoreVertical,
    Copy,
    Trash2,
    ExternalLink,
    FileIcon,
    Image as ImageIcon
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { mediaAPI } from "@/lib/api"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function MediaItem({ item, onDelete }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const copyUrl = () => {
        navigator.clipboard.writeText(item.url)
        toast.success("URL kopyalandı")
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await mediaAPI.remove(item.id)
            toast.success("Medya silindi")
            if (onDelete) onDelete(item.id)
        } catch (error) {
            console.error("Delete error:", error)
            // Check if it's a usage error (backend returns 400 with usedIn)
            if (error.response?.status === 400 && error.response?.data?.canForceDelete) {
                toast.error("Bu medya kullanılıyor. Zorla silmek için tekrar deneyin (Henüz implement edilmedi)")
                // TODO: Implement force delete logic if needed, for now just show error
            } else {
                toast.error("Silme işlemi başarısız oldu")
            }
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    const isImage = item.resourceType === 'image' || item.mimetype?.startsWith('image/')

    return (
        <>
            <Card className="overflow-hidden group relative">
                <CardContent className="p-0 aspect-square bg-muted/20 relative">
                    {isImage ? (
                        <img
                            src={item.responsive?.medium || item.url}
                            alt={item.alt || item.originalName}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <FileIcon className="w-12 h-12" />
                        </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={copyUrl}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    URL Kopyala
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.open(item.url, '_blank')}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Görüntüle
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Sil
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>

                <CardFooter className="p-3 flex flex-col items-start gap-1">
                    <p className="text-sm font-medium truncate w-full" title={item.originalName}>
                        {item.originalName}
                    </p>
                    <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                        <span>{(item.size / 1024).toFixed(1)} KB</span>
                        <span>{item.width}x{item.height}</span>
                    </div>
                </CardFooter>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Silmek istediğinize emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. Medya kalıcı olarak silinecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); handleDelete(); }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleting}
                        >
                            {deleting ? "Siliniyor..." : "Sil"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
