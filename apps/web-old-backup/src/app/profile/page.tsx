'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, User, LogOut, MapPin, CreditCard } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!user) return null;

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <div className="container mx-auto py-10 px-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar / User Info */}
                <div className="w-full md:w-1/4 space-y-6">
                    <Card className="overflow-hidden border-none shadow-md bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-4 relative">
                                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="bg-brand-primary text-white text-2xl">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle className="text-xl font-bold">{user.name}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                                className="w-full justify-start"
                                onClick={() => setActiveTab('overview')}
                            >
                                <User className="mr-2 h-4 w-4" /> Genel Bakış
                            </Button>
                            <Button
                                variant={activeTab === 'orders' ? 'default' : 'ghost'}
                                className="w-full justify-start"
                                onClick={() => setActiveTab('orders')}
                            >
                                <Package className="mr-2 h-4 w-4" /> Siparişlerim
                            </Button>
                            <Button
                                variant={activeTab === 'addresses' ? 'default' : 'ghost'}
                                className="w-full justify-start"
                                onClick={() => setActiveTab('addresses')}
                            >
                                <MapPin className="mr-2 h-4 w-4" /> Adreslerim
                            </Button>
                            <div className="pt-4 mt-4 border-t">
                                <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6 mt-0">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">0</div>
                                        <p className="text-xs text-muted-foreground">Geçmiş siparişleriniz</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Kayıtlı Adres</CardTitle>
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">1</div>
                                        <p className="text-xs text-muted-foreground">Teslimat adresiniz</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Ödeme Yöntemi</CardTitle>
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">-</div>
                                        <p className="text-xs text-muted-foreground">Kayıtlı kartınız yok</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Son Aktiviteler</CardTitle>
                                    <CardDescription>Hesabınızdaki son hareketler.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground text-center py-8">
                                        Henüz bir aktivite bulunmuyor.
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Orders Tab */}
                        <TabsContent value="orders" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sipariş Geçmişi</CardTitle>
                                    <CardDescription>Geçmiş siparişlerinizi görüntüleyin ve takip edin.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="bg-neutral-100 p-4 rounded-full mb-4">
                                            <Package className="h-8 w-8 text-neutral-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold">Henüz siparişiniz yok</h3>
                                        <p className="text-muted-foreground mt-1 mb-4">Lezzetli tatlılarımızı denemek için hemen alışverişe başlayın.</p>
                                        <Button onClick={() => router.push('/collection')}>Alışverişe Başla</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Addresses Tab */}
                        <TabsContent value="addresses" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Adreslerim</CardTitle>
                                    <CardDescription>Teslimat adreslerinizi yönetin.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        Adres yönetimi yakında eklenecek.
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </Tabs>
                </div>
            </div>
        </div>
    );
}
