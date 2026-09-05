import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const EcoMapaDfApp());
}

/// ============================================================================
/// 1. MODELOS DE DADOS (WastePoint e Ecopontos)
/// ============================================================================
class WastePoint {
  final String id;
  final double latitude;
  final double longitude;
  final String tipoPonto;
  final String categoriaResiduo;
  final String materialPredominante;
  final String residuoMisto;
  final String? imagem;
  final String observacao;
  final DateTime dataHora;
  final String status;
  final bool isDemo;

  WastePoint({
    required this.id,
    required this.latitude,
    required this.longitude,
    required this.tipoPonto,
    required this.categoriaResiduo,
    required this.materialPredominante,
    required this.residuoMisto,
    this.imagem,
    required this.observacao,
    required this.dataHora,
    this.status = 'pendente',
    this.isDemo = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'latitude': latitude,
      'longitude': longitude,
      'tipoPonto': tipoPonto,
      'categoriaResiduo': categoriaResiduo,
      'materialPredominante': materialPredominante,
      'residuoMisto': residuoMisto,
      'imagem': imagem,
      'observacao': observacao,
      'dataHora': dataHora.toIso8601String(),
      'status': status,
      'isDemo': isDemo,
    };
  }

  factory WastePoint.fromMap(Map<String, dynamic> map) {
    return WastePoint(
      id: map['id'] ?? '',
      latitude: (map['latitude'] as num).toDouble(),
      longitude: (map['longitude'] as num).toDouble(),
      tipoPonto: map['tipoPonto'] ?? 'Descarte irregular',
      categoriaResiduo: map['categoriaResiduo'] ?? 'Outro',
      materialPredominante: map['materialPredominante'] ?? 'Outro',
      residuoMisto: map['residuoMisto'] ?? 'Não identificado',
      imagem: map['imagem'],
      observacao: map['observacao'] ?? '',
      dataHora: map['dataHora'] != null
          ? DateTime.parse(map['dataHora'])
          : DateTime.now(),
      status: map['status'] ?? 'pendente',
      isDemo: map['isDemo'] ?? false,
    );
  }

  String toJson() => json.encode(toMap());

  factory WastePoint.fromJson(String source) =>
      WastePoint.fromMap(json.decode(source));
}

class AppConstants {
  static const double riachoFundoLat = -15.8824;
  static const double riachoFundoLng = -47.9942;
  static const String appName = 'EcoMapa DF';
  static const String appSubtitle = 'Mapeando resíduos. Construindo soluções.';
}

class MaterialCategories {
  static const List<String> list = [
    'Plástico',
    'Vidro',
    'Metal',
    'Papel/Papelão',
    'Madeira',
    'Resíduo de construção',
    'Resíduo eletrônico',
    'Resíduo orgânico',
    'Têxtil',
    'Borracha',
    'Resíduo misto',
    'Outro',
  ];

  static const List<String> pointTypes = [
    'Descarte irregular',
    'Ponto adequado',
    'Ecoponto',
    'Outro',
  ];
}

final List<WastePoint> initialDemoPoints = [
  WastePoint(
    id: 'demo-1',
    latitude: -15.8824,
    longitude: -47.9942,
    tipoPonto: 'Descarte irregular',
    categoriaResiduo: 'Resíduo de construção',
    materialPredominante: 'Cerâmica/Alvenaria',
    residuoMisto: 'Sim',
    observacao: 'Descarte irregular de restos de reforma e argamassa na calçada.',
    dataHora: DateTime.now().subtract(const Duration(days: 2)),
    status: 'pendente',
    isDemo: true,
  ),
  WastePoint(
    id: 'demo-2',
    latitude: -15.8801,
    longitude: -47.9915,
    tipoPonto: 'Ecoponto',
    categoriaResiduo: 'Resíduo de construção',
    materialPredominante: 'Diversos',
    residuoMisto: 'Sim',
    observacao: 'Papa-Entulho SLU oficial de Riacho Fundo I (QN 7).',
    dataHora: DateTime.now().subtract(const Duration(days: 10)),
    status: 'validado',
    isDemo: true,
  ),
  WastePoint(
    id: 'demo-3',
    latitude: -15.8850,
    longitude: -47.9960,
    tipoPonto: 'Descarte irregular',
    categoriaResiduo: 'Plástico',
    materialPredominante: 'Polímeros (PET e PEAD)',
    residuoMisto: 'Sim',
    observacao: 'Garrafas e sacolas descartadas em área verde próxima à QN 5.',
    dataHora: DateTime.now().subtract(const Duration(days: 1)),
    status: 'pendente',
    isDemo: true,
  ),
  WastePoint(
    id: 'demo-4',
    latitude: -15.8785,
    longitude: -47.9978,
    tipoPonto: 'Ponto adequado',
    categoriaResiduo: 'Vidro',
    materialPredominante: 'Vidro',
    residuoMisto: 'Não',
    observacao: 'Ponto de entrega voluntária de garrafas e recipientes.',
    dataHora: DateTime.now().subtract(const Duration(hours: 12)),
    status: 'validado',
    isDemo: true,
  ),
  WastePoint(
    id: 'demo-5',
    latitude: -15.8860,
    longitude: -48.0040,
    tipoPonto: 'Descarte irregular',
    categoriaResiduo: 'Madeira',
    materialPredominante: 'Madeira/Compensado',
    residuoMisto: 'Sim',
    observacao: 'Móveis desmontados e sobras de marcenaria.',
    dataHora: DateTime.now().subtract(const Duration(hours: 4)),
    status: 'pendente',
    isDemo: true,
  ),
];

/// ============================================================================
/// 2. SERVIÇOS (Storage e GPS)
/// ============================================================================
class StorageService {
  static const String _storageKey = 'ecomapa_points_v1';

  static Future<List<WastePoint>> loadPoints() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? jsonStr = prefs.getString(_storageKey);
      if (jsonStr == null || jsonStr.isEmpty) {
        await savePoints(initialDemoPoints);
        return initialDemoPoints;
      }
      final List<dynamic> decoded = json.decode(jsonStr);
      return decoded.map((m) => WastePoint.fromMap(m)).toList();
    } catch (e) {
      return initialDemoPoints;
    }
  }

  static Future<bool> savePoints(List<WastePoint> points) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final listMap = points.map((p) => p.toMap()).toList();
      return await prefs.setString(_storageKey, json.encode(listMap));
    } catch (e) {
      return false;
    }
  }

  static Future<bool> addPoint(WastePoint point) async {
    final current = await loadPoints();
    current.insert(0, point);
    return await savePoints(current);
  }
}

class LocationService {
  static Future<Position?> getCurrentPosition() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return null;

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return null;
      }
      if (permission == LocationPermission.deniedForever) return null;

      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
    } catch (e) {
      return null;
    }
  }
}

/// ============================================================================
/// 3. APLICATIVO PRINCIPAL E NAVEGAÇÃO
/// ============================================================================
class EcoMapaDfApp extends StatelessWidget {
  const EcoMapaDfApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EcoMapa DF',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2E7D32),
          primary: const Color(0xFF2E7D32),
          secondary: const Color(0xFF15803D),
          surface: Colors.white,
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        appBarTheme: const AppBarTheme(
          centerTitle: false,
          elevation: 0,
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF0F172A),
          titleTextStyle: TextStyle(
            color: Color(0xFF0F172A),
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  void _onNavigateToTab(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      HomeScreen(onNavigateToTab: _onNavigateToTab),
      const MapScreen(),
      RegisterScreen(onPointSaved: () => _onNavigateToTab(1)),
      const StatisticsScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        backgroundColor: Colors.white,
        indicatorColor: const Color(0xFFE8F5E9),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home, color: Color(0xFF1B5E20)),
            label: 'Início',
          ),
          NavigationDestination(
            icon: Icon(Icons.map_outlined),
            selectedIcon: Icon(Icons.map, color: Color(0xFF1B5E20)),
            label: 'Mapa',
          ),
          NavigationDestination(
            icon: Icon(Icons.add_location_alt_outlined),
            selectedIcon: Icon(Icons.add_location_alt, color: Color(0xFF1B5E20)),
            label: 'Registrar',
          ),
          NavigationDestination(
            icon: Icon(Icons.bar_chart_outlined),
            selectedIcon: Icon(Icons.bar_chart, color: Color(0xFF1B5E20)),
            label: 'Estatísticas',
          ),
        ],
      ),
    );
  }
}

/// ============================================================================
/// 4. TELA INICIAL (HomeScreen)
/// ============================================================================
class HomeScreen extends StatefulWidget {
  final Function(int) onNavigateToTab;
  const HomeScreen({super.key, required this.onNavigateToTab});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<WastePoint> _points = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final pts = await StorageService.loadPoints();
    if (mounted) {
      setState(() {
        _points = pts;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalIrregulares = _points.where((p) => p.tipoPonto == 'Descarte irregular').length;
    final totalEcopontos = _points.where((p) => p.tipoPonto == 'Ecoponto').length;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF2E7D32),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.eco, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('EcoMapa DF', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Text('Ciência Cidadã • Riacho Fundo I', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              ],
            ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1B5E20), Color(0xFF2E7D32)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF2E7D32).withOpacity(0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Mapeamento de Resíduos Sólidos',
                          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Identifique descartes, conheça a classe dos materiais e ajude a transformar a gestão ambiental no DF.',
                          style: TextStyle(color: Color(0xFFE8F5E9), fontSize: 13, height: 1.4),
                        ),
                        const SizedBox(height: 14),
                        ElevatedButton.icon(
                          onPressed: () => widget.onNavigateToTab(2),
                          icon: const Icon(Icons.camera_alt, size: 16),
                          label: const Text('Registrar Novo Ponto'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: const Color(0xFF1B5E20),
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Expanded(
                        child: _statCard('Total Registros', '${_points.length}', Icons.location_on, Colors.blue),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _statCard('Descartes Irreg.', '$totalIrregulares', Icons.warning_amber_rounded, Colors.amber.shade800),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _statCard('Ecopontos', '$totalEcopontos', Icons.recycling, Colors.green),
                      ),
                    ],
                  ),
                  const SizedBox(height: 22),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => widget.onNavigateToTab(1),
                          icon: const Icon(Icons.map, size: 18),
                          label: const Text('Explorar Mapa'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => widget.onNavigateToTab(3),
                          icon: const Icon(Icons.bar_chart, size: 18),
                          label: const Text('Estatísticas'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Registros Recentes em Riacho Fundo',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 12),
                  ..._points.take(5).map((p) => _pointCard(p)),
                ],
              ),
            ),
    );
  }

  Widget _statCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 6),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 2),
          Text(title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
        ],
      ),
    );
  }

  Widget _pointCard(WastePoint point) {
    final isIrregular = point.tipoPonto == 'Descarte irregular';
    final color = isIrregular ? Colors.red.shade700 : (point.tipoPonto == 'Ecoponto' ? Colors.blue.shade700 : Colors.green.shade700);

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: Border.all(color: Colors.grey.shade200),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.12),
          child: Icon(
            isIrregular ? Icons.warning : (point.tipoPonto == 'Ecoponto' ? Icons.recycling : Icons.check_circle),
            color: color,
            size: 20,
          ),
        ),
        title: Text(
          point.tipoPonto,
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color),
        ),
        subtitle: Text(
          '${point.categoriaResiduo} • ${point.observacao.isEmpty ? "Sem observações" : point.observacao}',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
        ),
        trailing: const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
        onTap: () => widget.onNavigateToTab(1),
      ),
    );
  }
}

/// ============================================================================
/// 5. TELA DE MAPA (MapScreen com OpenStreetMap)
/// ============================================================================
class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();
  List<WastePoint> _points = [];
  String _selectedFilter = 'Todos';
  LatLng? _userLocation;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPoints();
  }

  Future<void> _loadPoints() async {
    final pts = await StorageService.loadPoints();
    if (mounted) {
      setState(() {
        _points = pts;
        _isLoading = false;
      });
    }
  }

  Future<void> _locateUser() async {
    final pos = await LocationService.getCurrentPosition();
    if (pos != null && mounted) {
      setState(() {
        _userLocation = LatLng(pos.latitude, pos.longitude);
      });
      _mapController.move(_userLocation!, 16.0);
    }
  }

  List<WastePoint> get _filteredPoints {
    if (_selectedFilter == 'Todos') return _points;
    return _points.where((p) => p.tipoPonto == _selectedFilter || p.categoriaResiduo == _selectedFilter).toList();
  }

  Color _getMarkerColor(WastePoint p) {
    if (p.tipoPonto == 'Descarte irregular') return const Color(0xFFDC2626);
    if (p.tipoPonto == 'Ecoponto') return const Color(0xFF2563EB);
    return const Color(0xFF16A34A);
  }

  void _showPointDetails(WastePoint p) {
    final color = _getMarkerColor(p);
    final dateStr = DateFormat('dd/MM/yyyy HH:mm').format(p.dataHora);

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      backgroundColor: Colors.white,
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: color.withOpacity(0.15),
                    child: Icon(Icons.location_on, color: color),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p.tipoPonto, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
                        Text('Data: $dateStr', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                      ],
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),
              _rowItem('Material:', p.categoriaResiduo),
              _rowItem('Subclasse:', p.materialPredominante),
              _rowItem('Misto:', p.residuoMisto),
              _rowItem('Coordenadas:', '${p.latitude.toStringAsFixed(5)}, ${p.longitude.toStringAsFixed(5)}'),
              const SizedBox(height: 8),
              const Text('Observação:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              Text(
                p.observacao.isEmpty ? 'Sem observações adicionais.' : p.observacao,
                style: const TextStyle(fontSize: 13, color: Color(0xFF334155)),
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  Widget _rowItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.5),
      child: Row(
        children: [
          SizedBox(width: 110, child: Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)))),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mapa Riacho Fundo I (DF)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            tooltip: 'Minha Localização GPS',
            onPressed: _locateUser,
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Atualizar',
            onPressed: _loadPoints,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: const MapOptions(
                    initialCenter: LatLng(AppConstants.riachoFundoLat, AppConstants.riachoFundoLng),
                    initialZoom: 14.5,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.ecomapa.df',
                    ),
                    MarkerLayer(
                      markers: [
                        if (_userLocation != null)
                          Marker(
                            point: _userLocation!,
                            width: 40,
                            height: 40,
                            child: const Icon(Icons.person_pin_circle, color: Colors.blueAccent, size: 36),
                          ),
                        ..._filteredPoints.map((p) {
                          final color = _getMarkerColor(p);
                          return Marker(
                            point: LatLng(p.latitude, p.longitude),
                            width: 38,
                            height: 38,
                            child: GestureDetector(
                              onTap: () => _showPointDetails(p),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: color,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 2.5),
                                  boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2))],
                                ),
                                child: const Icon(Icons.delete_outline, color: Colors.white, size: 20),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ],
                ),
                Positioned(
                  top: 12,
                  left: 12,
                  right: 12,
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        'Todos',
                        'Descarte irregular',
                        'Ecoponto',
                        'Ponto adequado',
                        'Plástico',
                        'Resíduo de construção',
                        'Metal',
                        'Vidro',
                      ].map((f) {
                        final isSelected = _selectedFilter == f;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: FilterChip(
                            label: Text(f, style: TextStyle(fontSize: 12, color: isSelected ? Colors.white : Colors.black87)),
                            selected: isSelected,
                            selectedColor: const Color(0xFF2E7D32),
                            backgroundColor: Colors.white.withOpacity(0.92),
                            onSelected: (val) => setState(() => _selectedFilter = f),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}

/// ============================================================================
/// 6. TELA DE REGISTRO (RegisterScreen com GPS e Foto)
/// ============================================================================
class RegisterScreen extends StatefulWidget {
  final VoidCallback onPointSaved;
  const RegisterScreen({super.key, required this.onPointSaved});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  double _lat = AppConstants.riachoFundoLat;
  double _lng = AppConstants.riachoFundoLng;
  String _tipoPonto = 'Descarte irregular';
  String _categoriaResiduo = 'Plástico';
  String _residuoMisto = 'Sim';
  String _observacao = '';
  String? _imagePath;
  bool _isGettingLocation = false;
  bool _isSaving = false;

  final ImagePicker _picker = ImagePicker();

  Future<void> _captureGps() async {
    setState(() => _isGettingLocation = true);
    final pos = await LocationService.getCurrentPosition();
    if (pos != null && mounted) {
      setState(() {
        _lat = pos.latitude;
        _lng = pos.longitude;
        _isGettingLocation = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Coordenadas GPS obtidas com sucesso!'), backgroundColor: Color(0xFF2E7D32)),
      );
    } else if (mounted) {
      setState(() => _isGettingLocation = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Não foi possível obter o GPS. Usando centro de Riacho Fundo I.'), backgroundColor: Colors.orange),
      );
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? photo = await _picker.pickImage(source: source, imageQuality: 75);
      if (photo != null) {
        setState(() {
          _imagePath = photo.path;
        });
      }
    } catch (e) {
      debugPrint('Erro ao selecionar foto: $e');
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _isSaving = true);

    final newPoint = WastePoint(
      id: 'point-${DateTime.now().millisecondsSinceEpoch}',
      latitude: _lat,
      longitude: _lng,
      tipoPonto: _tipoPonto,
      categoriaResiduo: _categoriaResiduo,
      materialPredominante: _categoriaResiduo,
      residuoMisto: _residuoMisto,
      imagem: _imagePath,
      observacao: _observacao,
      dataHora: DateTime.now(),
      status: 'pendente',
      isDemo: false,
    );

    await StorageService.addPoint(newPoint);

    if (mounted) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ponto registrado com sucesso no EcoMapa DF!'), backgroundColor: Color(0xFF2E7D32)),
      );
      widget.onPointSaved();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Registrar Ponto no DF'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Card(
                elevation: 0,
                color: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: Border.all(color: Colors.grey.shade200),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.gps_fixed, color: Color(0xFF2E7D32), size: 20),
                          SizedBox(width: 8),
                          Text('Localização Georreferenciada', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Lat: ${_lat.toStringAsFixed(5)} | Lng: ${_lng.toStringAsFixed(5)}',
                        style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 10),
                      ElevatedButton.icon(
                        onPressed: _isGettingLocation ? null : _captureGps,
                        icon: _isGettingLocation
                            ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                            : const Icon(Icons.my_location, size: 16),
                        label: Text(_isGettingLocation ? 'Buscando satélites...' : 'Capturar Meu GPS Atual'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE8F5E9),
                          foregroundColor: const Color(0xFF1B5E20),
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text('Tipo do Ponto:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _tipoPonto,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                items: MaterialCategories.pointTypes.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                onChanged: (val) => setState(() => _tipoPonto = val!),
              ),
              const SizedBox(height: 16),
              const Text('Categoria do Material Predominante:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _categoriaResiduo,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                items: MaterialCategories.list.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (val) => setState(() => _categoriaResiduo = val!),
              ),
              const SizedBox(height: 16),
              const Text('Resíduo Misto ou Contaminado?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _residuoMisto,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                items: ['Sim', 'Não', 'Não identificado'].map((m) => DropdownMenuItem(value: m, child: Text(m))).toList(),
                onChanged: (val) => setState(() => _residuoMisto = val!),
              ),
              const SizedBox(height: 16),
              Card(
                elevation: 0,
                color: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: Border.all(color: Colors.grey.shade200),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    children: [
                      if (_imagePath != null) ...[
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(File(_imagePath!), height: 140, width: double.infinity, fit: BoxFit.cover),
                        ),
                        const SizedBox(height: 10),
                      ],
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => _pickImage(ImageSource.camera),
                              icon: const Icon(Icons.camera_alt, size: 18),
                              label: const Text('Câmera'),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => _pickImage(ImageSource.gallery),
                              icon: const Icon(Icons.photo_library, size: 18),
                              label: const Text('Galeria'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text('Observações / Descrição:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Ex: Garrafas e entulho acumulados na esquina próxima ao lote...',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onSaved: (val) => _observacao = val ?? '',
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _isSaving ? null : _save,
                icon: _isSaving
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.check),
                label: Text(_isSaving ? 'Salvando...' : 'Salvar Registro no Mapa'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2E7D32),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

/// ============================================================================
/// 7. TELA DE ESTATÍSTICAS (StatisticsScreen - Ciência dos Materiais)
/// ============================================================================
class StatisticsScreen extends StatefulWidget {
  const StatisticsScreen({super.key});

  @override
  State<StatisticsScreen> createState() => _StatisticsScreenState();
}

class _StatisticsScreenState extends State<StatisticsScreen> {
  List<WastePoint> _points = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final pts = await StorageService.loadPoints();
    if (mounted) {
      setState(() {
        _points = pts;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final total = _points.isEmpty ? 1 : _points.length;
    final Map<String, int> materialCount = {};
    for (var p in _points) {
      materialCount[p.categoriaResiduo] = (materialCount[p.categoriaResiduo] ?? 0) + 1;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Estatísticas dos Resíduos'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Visão Geral dos Materiais', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text('Total de ${_points.length} pontos mapeados na região de Riacho Fundo I.', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                const SizedBox(height: 16),
                ...materialCount.entries.map((entry) {
                  final pct = (entry.value / total) * 100;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            Text(entry.key, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                            Text('${entry.value} (${pct.toStringAsFixed(1)}%)', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                          ],
                        ),
                        const SizedBox(height: 4),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: entry.value / total,
                            minHeight: 8,
                            backgroundColor: Colors.grey.shade200,
                            valueColor: const AlwaysStoppedAnimation(Color(0xFF2E7D32)),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F8E9),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFC8E6C9)),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.science, color: Color(0xFF2E7D32), size: 20),
                    SizedBox(width: 8),
                    Text('Fundamentos em Ciência dos Materiais', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1B5E20))),
                  ],
                ),
                SizedBox(height: 8),
                Text(
                  'A correta classificação entre polímeros, cerâmicos, metais e materiais cimentícios auxilia a identificar o tempo de degradação, o potencial de reciclagem e o impacto ambiental direto na bacia hidrográfica do DF.',
                  style: TextStyle(fontSize: 12.5, color: Color(0xFF2E7D32), height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
