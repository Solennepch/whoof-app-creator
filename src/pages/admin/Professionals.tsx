import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Star,
  TrendingUp,
  Download,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { exportProfessionalsToCSV } from "@/utils/exportCSV";

interface ProProfile {
  id: string;
  user_id: string;
  business_name: string;
  activity: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  city: string | null;
  verified: boolean | null;
  is_published: boolean | null;
  rating_avg: number | null;
  views_count: number | null;
  clicks_count: number | null;
  siret: string | null;
  tags: string[] | null;
  created_at: string | null;
}

export default function AdminProfessionals() {
  const [pros, setPros] = useState<ProProfile[]>([]);
  const [filteredPros, setFilteredPros] = useState<ProProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<string>("all");

  useEffect(() => {
    loadPros();
  }, []);

  useEffect(() => {
    filterPros();
  }, [searchTerm, verifiedFilter, publishedFilter, activityFilter, pros]);

  const loadPros = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pro_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPros(data || []);
    } catch (error) {
      console.error('Error loading professionals:', error);
      toast.error("Erreur lors du chargement des professionnels");
    } finally {
      setLoading(false);
    }
  };

  const filterPros = () => {
    let filtered = [...pros];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (pro) =>
          pro.business_name?.toLowerCase().includes(term) ||
          pro.activity?.toLowerCase().includes(term) ||
          pro.city?.toLowerCase().includes(term) ||
          pro.email?.toLowerCase().includes(term)
      );
    }

    // Verified filter
    if (verifiedFilter !== "all") {
      filtered = filtered.filter((pro) => 
        verifiedFilter === "verified" ? pro.verified : !pro.verified
      );
    }

    // Published filter
    if (publishedFilter !== "all") {
      filtered = filtered.filter((pro) => 
        publishedFilter === "published" ? pro.is_published : !pro.is_published
      );
    }

    // Activity filter
    if (activityFilter !== "all") {
      filtered = filtered.filter((pro) => pro.activity === activityFilter);
    }

    setFilteredPros(filtered);
  };

  const handleVerify = async (proId: string, verify: boolean) => {
    try {
      const { error } = await supabase
        .from('pro_profiles')
        .update({ verified: verify })
        .eq('id', proId);

      if (error) throw error;

      toast.success(verify ? "Professionnel vérifié" : "Vérification retirée");
      loadPros();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handlePublish = async (proId: string, publish: boolean) => {
    try {
      const { error } = await supabase
        .from('pro_profiles')
        .update({ is_published: publish })
        .eq('id', proId);

      if (error) throw error;

      toast.success(publish ? "Profil publié" : "Profil dépublié");
      loadPros();
    } catch (error) {
      console.error('Error updating publication status:', error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const getUniqueActivities = () => {
    const activities = new Set(pros.map(p => p.activity));
    return Array.from(activities).sort();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Professionnels</h1>
          <p className="text-muted-foreground">
            {filteredPros.length} professionnel{filteredPros.length > 1 ? 's' : ''} trouvé{filteredPros.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => exportProfessionalsToCSV(filteredPros)} 
            variant="outline"
            disabled={filteredPros.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button onClick={loadPros} variant="outline">
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pros.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vérifiés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pros.filter(p => p.verified).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiés</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pros.filter(p => p.is_published).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pros.filter(p => !p.verified).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Rechercher et filtrer les professionnels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, activité, ville, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Vérification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="verified">Vérifiés</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={publishedFilter} onValueChange={setPublishedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Publication" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="published">Publiés</SelectItem>
                <SelectItem value="unpublished">Non publiés</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Activité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {getUniqueActivities().map((activity) => (
                  <SelectItem key={activity} value={activity}>
                    {activity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Professionals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des professionnels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professionnel</TableHead>
                <TableHead>Activité</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Aucun professionnel trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredPros.map((pro) => (
                  <TableRow key={pro.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={pro.logo_url || undefined} />
                          <AvatarFallback>
                            {pro.business_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{pro.business_name}</div>
                          {pro.siret && (
                            <div className="text-xs text-muted-foreground">
                              SIRET: {pro.siret}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{pro.activity}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        {pro.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {pro.email}
                          </div>
                        )}
                        {pro.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {pro.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {pro.city && (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {pro.city}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge 
                          variant={pro.verified ? "default" : "secondary"}
                          className="w-fit"
                        >
                          {pro.verified ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Vérifié</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> Non vérifié</>
                          )}
                        </Badge>
                        <Badge 
                          variant={pro.is_published ? "default" : "outline"}
                          className="w-fit"
                        >
                          {pro.is_published ? (
                            <><Eye className="h-3 w-3 mr-1" /> Publié</>
                          ) : (
                            <><EyeOff className="h-3 w-3 mr-1" /> Non publié</>
                          )}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        {pro.rating_avg !== null && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {pro.rating_avg.toFixed(1)}
                          </div>
                        )}
                        <div className="text-muted-foreground">
                          {pro.views_count || 0} vues
                        </div>
                        <div className="text-muted-foreground">
                          {pro.clicks_count || 0} clics
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {pro.created_at && format(new Date(pro.created_at), 'dd MMM yyyy', { locale: fr })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Link to={`/admin/professionals/${pro.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Détails
                          </Button>
                        </Link>
                        {!pro.verified ? (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleVerify(pro.id, true)}
                            className="w-full"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Vérifier
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerify(pro.id, false)}
                            className="w-full"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Retirer
                          </Button>
                        )}
                        {!pro.is_published ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handlePublish(pro.id, true)}
                            className="w-full"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Publier
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePublish(pro.id, false)}
                            className="w-full"
                          >
                            <EyeOff className="h-3 w-3 mr-1" />
                            Dépublier
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
