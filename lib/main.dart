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
      dataHora: map['dataHora'] != null ? DateTime.parse(map['dataHora']) : DateTime.now(),
      status: map['status'] ?? 'pendente',
      isDemo: map['isDemo'] ?? false,
    );
  }
}

class AppConstants {
  static const double riachoFundoLat = -15.8824;
  static const double riachoFundoLng = -47.9942;
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
    observacao: 'Descarte irregular na calçada.',
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
    observacao: 'Papa-Entulho SLU oficial de Riacho Fundo I.',
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
    materialPredominante: 'Polímeros (PET)',
    residuoMisto: 'Sim',
    observacao: 'Garrafas e sacolas em área verde.',
    dataHora: DateTime.now().subtract(const Duration(days: 1)),
    status: 'pendente',
    isDemo: true,
  ),
];

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
          surface: Colors.white,
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

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      HomeScreen(onNavigateToTab: (idx) => setState(() => _currentIndex = idx)),
      const MapScreen(),
      RegisterScreen(onPointSaved: () => setState(() => _currentIndex = 1)),
      const StatisticsScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Início'),
          NavigationDestination(icon: Icon(Icons.map_outlined), selectedIcon: Icon(Icons.map), label: 'Mapa'),
          NavigationDestination(icon: Icon(Icons.add_location_alt_outlined), selectedIcon: Icon(Icons.add_location_alt), label: 'Registrar'),
          NavigationDestination(icon: Icon(Icons.bar_chart_outlined), selectedIcon: Icon(Icons.bar_chart), label: 'Estatísticas'),
        ],
      ),
    );
  }
}

class HomeScreen extends StatefulWidget {
  final Function(int) onNavigateToTab;
  const HomeScreen({super.key, required this.onNavigateToTab});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<WastePoint> _points = [];

  @override
  void initState() {
    super.initState();
    StorageService.loadPoints().then((pts) {
      if (mounted) setState(() => _points = pts);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('EcoMapa DF • Riacho Fundo I')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: const Color(0xFF2E7D32),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Mapeamento de Resíduos', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text('Identifique descartes e ajude a transformar a gestão ambiental no DF.', style: TextStyle(color: Colors.white70)),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    onPressed: () => widget.onNavigateToTab(2),
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Registrar Novo Ponto'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text('Total de pontos registrados: ${_points.length}', style: const TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          ..._points.map((p) => ListTile(
            leading: Icon(p.tipoPonto == 'Ecoponto' ? Icons.recycling : Icons.warning, color: p.tipoPonto == 'Ecoponto' ? Colors.green : Colors.red),
            title: Text(p.tipoPonto),
            subtitle: Text('${p.categoriaResiduo} - ${p.observacao}'),
            onTap: () => widget.onNavigateToTab(1),
          )),
        ],
      ),
    );
  }
}

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  List<WastePoint> _points = [];

  @override
  void initState() {
    super.initState();
    StorageService.loadPoints().then((pts) {
      if (mounted) setState(() => _points = pts);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mapa dos Resíduos')),
      body: FlutterMap(
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
            markers: _points.map((p) {
              return Marker(
                point: LatLng(p.latitude, p.longitude),
                child: Icon(
                  Icons.location_pin,
                  color: p.tipoPonto == 'Ecoponto' ? Colors.green : Colors.red,
                  size: 36,
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class RegisterScreen extends StatefulWidget {
  final VoidCallback onPointSaved;
  const RegisterScreen({super.key, required this.onPointSaved});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  String _tipo = 'Descarte irregular';
  String _cat = 'Plástico';
  String _obs = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Registrar Descarte')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            DropdownButtonFormField<String>(
              value: _tipo,
              items: ['Descarte irregular', 'Ecoponto', 'Ponto adequado']
                  .map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
              onChanged: (val) => setState(() => _tipo = val!),
              decoration: const InputDecoration(labelText: 'Tipo do Ponto'),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _cat,
              items: ['Plástico', 'Vidro', 'Metal', 'Resíduo de construção', 'Madeira']
                  .map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
              onChanged: (val) => setState(() => _cat = val!),
              decoration: const InputDecoration(labelText: 'Material Predominante'),
            ),
            const SizedBox(height: 12),
            TextField(
              decoration: const InputDecoration(labelText: 'Observação'),
              onChanged: (val) => _obs = val,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                final pt = WastePoint(
                  id: '${DateTime.now().millisecondsSinceEpoch}',
                  latitude: AppConstants.riachoFundoLat + (0.001 * (_tipo == 'Ecoponto' ? 1 : -1)),
                  longitude: AppConstants.riachoFundoLng,
                  tipoPonto: _tipo,
                  categoriaResiduo: _cat,
                  materialPredominante: _cat,
                  residuoMisto: 'Sim',
                  observacao: _obs,
                  dataHora: DateTime.now(),
                );
                await StorageService.addPoint(pt);
                widget.onPointSaved();
              },
              child: const Text('Salvar no Mapa'),
            ),
          ],
        ),
      ),
    );
  }
}

class StatisticsScreen extends StatelessWidget {
  const StatisticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Estatísticas')),
      body: const Center(
        child: Text('Painel de Ciência dos Materiais e Resíduos DF'),
      ),
    );
  }
}
