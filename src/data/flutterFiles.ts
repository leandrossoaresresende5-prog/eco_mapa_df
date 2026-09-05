import { FlutterProjectFile } from '../types';

export const FLUTTER_PROJECT_FILES: FlutterProjectFile[] = [
  {
    path: 'pubspec.yaml',
    language: 'yaml',
    description: 'Configuração do projeto Flutter e dependências de GPS, Câmera, Mapa e Armazenamento.',
    code: `name: ecomapa_df
description: "EcoMapa DF - Plataforma de ciência cidadã para monitoramento de resíduos e ecopontos no Distrito Federal."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # Ícones e Material 3
  cupertino_icons: ^1.0.8

  # Mapa interativo livre e leve (OpenStreetMap) - funciona direto sem cartão/chaves de API
  flutter_map: ^7.0.2
  latlong2: ^0.9.1

  # Geolocalização GPS real e permissões
  geolocator: ^13.0.2

  # Câmera e seleção de imagens da galeria
  image_picker: ^1.1.2

  # Armazenamento local persistente em JSON (pronto para migrar para Firebase/Firestore)
  shared_preferences: ^2.3.5

  # Formatação de datas em português
  intl: any

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^5.0.0

flutter:
  uses-material-design: true
`,
  },
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Permissões do Android para GPS (Localização precisa/aproximada), Câmera e Galeria de Fotos.',
    code: `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Permissões de Internet para carregar os mapas e ecopontos -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>

    <!-- Permissões de Localização GPS (Ciência Cidadã / Georreferenciamento) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Permissões para Câmera e Galeria de Fotos -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32"/>
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>

    <application
        android:label="EcoMapa DF"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:taskAffinity=""
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme"
              />
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
    <queries>
        <intent>
            <action android:name="android.intent.action.GET_CONTENT" />
            <data android:mimeType="image/*" />
        </intent>
    </queries>
</manifest>
`,
  },
  {
    path: 'lib/models/waste_point.dart',
    language: 'dart',
    description: 'Modelo de dados WastePoint com campos de Ciência dos Materiais e serialização JSON.',
    code: `import 'dart:convert';

/// Modelo de dados representando um ponto registrado no EcoMapa DF.
/// Conecta a identificação de campo à Ciência e Engenharia de Materiais.
class WastePoint {
  final String id;
  final double latitude;
  final double longitude;
  final String tipoPonto; // 'Descarte irregular', 'Ponto adequado', 'Ecoponto', 'Outro'
  final String categoriaResiduo; // 'Plástico', 'Vidro', 'Metal', etc.
  final String materialPredominante;
  final String residuoMisto; // 'Sim', 'Não', 'Não identificado'
  final String? imagem; // Caminho local do arquivo ou base64
  final String observacao;
  final DateTime dataHora;
  final String status; // 'pendente', 'validado', 'rejeitado'
  final bool isDemo; // Identifica dados de demonstração com clareza

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

  /// Converte o objeto para Map serializável em JSON
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

  /// Cria uma instância a partir de um Map decodificado de JSON
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

  WastePoint copyWith({
    String? id,
    double? latitude,
    double? longitude,
    String? tipoPonto,
    String? categoriaResiduo,
    String? materialPredominante,
    String? residuoMisto,
    String? imagem,
    String? observacao,
    DateTime? dataHora,
    String? status,
    bool? isDemo,
  }) {
    return WastePoint(
      id: id ?? this.id,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      tipoPonto: tipoPonto ?? this.tipoPonto,
      categoriaResiduo: categoriaResiduo ?? this.categoriaResiduo,
      materialPredominante: materialPredominante ?? this.materialPredominante,
      residuoMisto: residuoMisto ?? this.residuoMisto,
      imagem: imagem ?? this.imagem,
      observacao: observacao ?? this.observacao,
      dataHora: dataHora ?? this.dataHora,
      status: status ?? this.status,
      isDemo: isDemo ?? this.isDemo,
    );
  }
}
`,
  },
  {
    path: 'lib/data/demo_data.dart',
    language: 'dart',
    description: 'Dados iniciais de demonstração em Riacho Fundo I e lista de Ecopontos oficiais do SLU DF.',
    code: `import '../models/waste_point.dart';

/// Coordenadas de referência para a região de estudo: Riacho Fundo I, DF.
class AppConstants {
  static const double riachoFundoLat = -15.8824;
  static const double riachoFundoLng = -47.9942;
  static const String appName = 'EcoMapa DF';
  static const String appSubtitle = 'Mapeando resíduos. Construindo soluções.';
}

/// Categorias padronizadas de materiais conforme Ciência dos Materiais
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

  static const List<String> mixedOptions = [
    'Sim',
    'Não',
    'Não identificado',
  ];
}

/// Registros de demonstração georreferenciados em Riacho Fundo I.
/// Claramente etiquetados com [DADOS DE DEMONSTRAÇÃO].
List<WastePoint> getInitialDemoPoints() {
  return [
    WastePoint(
      id: 'demo-1',
      latitude: -15.8845,
      longitude: -47.9965,
      tipoPonto: 'Descarte irregular',
      categoriaResiduo: 'Resíduo de construção',
      materialPredominante: 'Resíduo de construção',
      residuoMisto: 'Sim',
      observacao:
          '[DADOS DE DEMONSTRAÇÃO] Entulho de reforma residencial com sacos plásticos na margem da via vicinal.',
      dataHora: DateTime.now().subtract(const Duration(days: 2)),
      status: 'validado',
      isDemo: true,
    ),
    WastePoint(
      id: 'demo-2',
      latitude: -15.8812,
      longitude: -47.9928,
      tipoPonto: 'Ecoponto',
      categoriaResiduo: 'Resíduo eletrônico',
      materialPredominante: 'Metal',
      residuoMisto: 'Não',
      observacao:
          '[DADOS DE DEMONSTRAÇÃO] Ponto de Entrega Voluntária com descarte adequado de monitores e placas eletrônicas.',
      dataHora: DateTime.now().subtract(const Duration(days: 3)),
      status: 'validado',
      isDemo: true,
    ),
    WastePoint(
      id: 'demo-3',
      latitude: -15.8890,
      longitude: -48.0012,
      tipoPonto: 'Descarte irregular',
      categoriaResiduo: 'Plástico',
      materialPredominante: 'Plástico',
      residuoMisto: 'Sim',
      observacao:
          '[DADOS DE DEMONSTRAÇÃO] Garrafas PET, sacolas e embalagens descartadas em lote vago próximo à QN 5.',
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
      observacao:
          '[DADOS DE DEMONSTRAÇÃO] Coletor comunitário para garrafas de vidro e frascos íntegros.',
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
      materialPredominante: 'Madeira',
      residuoMisto: 'Sim',
      observacao:
          '[DADOS DE DEMONSTRAÇÃO] Móveis desmontados e restos de compensado abandonados na calçada.',
      dataHora: DateTime.now().subtract(const Duration(hours: 4)),
      status: 'pendente',
      isDemo: true,
    ),
  ];
}

/// Modelo simples para Ecopontos oficiais / Papa-Entulho no DF.
class EcopointModel {
  final String nome;
  final String endereco;
  final String regiao;
  final List<String> materiais;
  final String horario;
  final double distanciaKm;

  const EcopointModel({
    required this.nome,
    required this.endereco,
    required this.regiao,
    required this.materiais,
    required this.horario,
    required this.distanciaKm,
  });
}

/// Lista de demonstração de Ecopontos (Papa-Entulho SLU) em Riacho Fundo e regiões vizinhas.
/// Local indicado no código para plugar futuramente a API oficial do SLU DF.
const List<EcopointModel> demoEcopointsList = [
  EcopointModel(
    nome: 'Papa-Entulho SLU - Riacho Fundo I',
    endereco: 'QN 7, Área Especial 01, Riacho Fundo I, DF',
    regiao: 'Riacho Fundo I',
    materiais: [
      'Entulho de alvenaria e obra (até 1m³)',
      'Madeira e móveis desmontados',
      'Podas de árvores e galhos',
      'Materiais recicláveis secos (plástico, papel, metal, vidro)'
    ],
    horario: 'Segunda a Sábado: 07h00 às 18h00',
    distanciaKm: 0.7,
  ),
  EcopointModel(
    nome: 'Papa-Entulho SLU - Riacho Fundo II',
    endereco: 'QN 14E, Lote 01, Riacho Fundo II, DF',
    regiao: 'Riacho Fundo II',
    materiais: [
      'Restos de reformas residenciais',
      'Mobiliário inservível',
      'Pneus e recicláveis secos'
    ],
    horario: 'Segunda a Sábado: 07h00 às 18h00',
    distanciaKm: 3.2,
  ),
  EcopointModel(
    nome: 'Papa-Entulho SLU - Núcleo Bandeirante',
    endereco: 'Setor de Oficinas, Conjunto A, Núcleo Bandeirante, DF',
    regiao: 'Núcleo Bandeirante',
    materiais: [
      'Resíduos volumosos',
      'Entulho da construção civil',
      'Metais e plásticos'
    ],
    horario: 'Segunda a Sábado: 07h00 às 18h00',
    distanciaKm: 4.1,
  ),
  EcopointModel(
    nome: 'Ponto de Coleta Voluntária - Praça Central RF1',
    endereco: 'Área Central, Riacho Fundo I (Próximo à Feira Permanente)',
    regiao: 'Riacho Fundo I',
    materiais: [
      'Garrafas PET e plásticos',
      'Papel e papelão',
      'Latas de alumínio',
      'Vidros limpos'
    ],
    horario: 'Acesso livre 24 horas',
    distanciaKm: 0.9,
  ),
];
`,
  },
  {
    path: 'lib/services/location_service.dart',
    language: 'dart',
    description: 'Serviço de GPS profissional com tratamento completo de permissões e ausência de sinal.',
    code: `import 'package:geolocator/geolocator.dart';

/// Resultado encapsulado da tentativa de obter localização GPS.
class LocationResult {
  final Position? position;
  final String? errorMessage;
  final bool isSuccess;

  LocationResult.success(this.position)
      : errorMessage = null,
        isSuccess = true;

  LocationResult.error(this.errorMessage)
      : position = null,
        isSuccess = false;
}

/// Serviço responsável por interagir com o GPS do dispositivo Android de forma segura.
class LocationService {
  /// Obtém a posição GPS atual, tratando todas as exceções e permissões sem fechar o app.
  static Future<LocationResult> getCurrentLocation() async {
    try {
      // 1. Verifica se o serviço de GPS do aparelho está ativo
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return LocationResult.error(
          'O GPS do seu celular está desativado. Por favor, ative a localização nas configurações do Android.',
        );
      }

      // 2. Verifica a permissão concedida pelo usuário
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return LocationResult.error(
            'Permissão de localização negada pelo usuário. Não foi possível obter o georreferenciamento.',
          );
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return LocationResult.error(
          'Permissões de localização permanentemente negadas. Habilite-as manualmente em Configurações > Aplicativos > EcoMapa DF.',
        );
      }

      // 3. Captura a localização com tempo limite de segurança
      Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 15),
        ),
      );

      return LocationResult.success(position);
    } catch (e) {
      return LocationResult.error(
        'Erro ao conectar ao sensor de GPS: \${e.toString()}',
      );
    }
  }
}
`,
  },
  {
    path: 'lib/services/storage_service.dart',
    language: 'dart',
    description: 'Serviço de persistência local em SharedPreferences com arquitetura pronta para Firebase/Firestore.',
    code: `import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/waste_point.dart';
import '../data/demo_data.dart';

/// Serviço de armazenamento local.
/// Organizado com métodos assíncronos desacoplados para permitir substituição direta
/// por Firebase Firestore ou Cloud SQL sem alterar as telas.
class StorageService {
  static const String _storageKey = 'ecomapa_df_waste_points';

  /// Carrega a lista de pontos salvos.
  /// Se for a primeira vez que o usuário abre o aplicativo, inicializa com dados de demonstração.
  static Future<List<WastePoint>> loadWastePoints() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? jsonString = prefs.getString(_storageKey);

      if (jsonString == null || jsonString.isEmpty) {
        // Inicializa com dados de demonstração de Riacho Fundo I
        final initialList = getInitialDemoPoints();
        await saveWastePoints(initialList);
        return initialList;
      }

      final List<dynamic> decodedList = json.decode(jsonString);
      return decodedList
          .map((item) => WastePoint.fromMap(item as Map<String, dynamic>))
          .toList();
    } catch (e) {
      // Fallback seguro em caso de falha de leitura
      return getInitialDemoPoints();
    }
  }

  /// Salva a lista completa de pontos de descarte no armazenamento local
  static Future<bool> saveWastePoints(List<WastePoint> points) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final List<Map<String, dynamic>> mapList =
          points.map((p) => p.toMap()).toList();
      final String jsonString = json.encode(mapList);
      return await prefs.setString(_storageKey, jsonString);
    } catch (e) {
      return false;
    }
  }

  /// Adiciona um novo ponto cadastrado à lista existente
  static Future<bool> addWastePoint(WastePoint newPoint) async {
    try {
      final currentList = await loadWastePoints();
      currentList.insert(0, newPoint); // Insere no topo
      return await saveWastePoints(currentList);
    } catch (e) {
      return false;
    }
  }

  /// Exclui um ponto pelo ID
  static Future<bool> deleteWastePoint(String id) async {
    try {
      final currentList = await loadWastePoints();
      currentList.removeWhere((item) => item.id == id);
      return await saveWastePoints(currentList);
    } catch (e) {
      return false;
    }
  }

  /// Restaura os dados originais de demonstração
  static Future<void> resetToDemoData() async {
    await saveWastePoints(getInitialDemoPoints());
  }
}
`,
  },
  {
    path: 'lib/widgets/statistic_card.dart',
    language: 'dart',
    description: 'Componente visual para exibição de métricas e gráficos de barras dos materiais.',
    code: `import 'package:flutter/material.dart';

/// Card para destacar contadores e resumos estatísticos
class MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final String? subtitle;

  const MetricCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: color.withOpacity(0.2), width: 1.5),
      ),
      color: color.withOpacity(0.06),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: color, size: 22),
                ),
                const Spacer(),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1E293B),
              ),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 2),
              Text(
                subtitle!,
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF64748B),
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}

/// Barra gráfica horizontal proporcional para cada categoria de material
class MaterialBarItem extends StatelessWidget {
  final String label;
  final int count;
  final int total;
  final Color color;

  const MaterialBarItem({
    super.key,
    required this.label,
    required this.count,
    required this.total,
    this.color = const Color(0xFF2E7D32),
  });

  @override
  Widget build(BuildContext context) {
    final double percentage = total > 0 ? (count / total) : 0.0;
    final int percentInt = (percentage * 100).round();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF1E293B),
                ),
              ),
              Text(
                '\$count (\$percentInt%)',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: percentage,
              minHeight: 10,
              backgroundColor: const Color(0xFFE2E8F0),
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/widgets/waste_point_card.dart',
    language: 'dart',
    description: 'Card de exibição de ponto no mapa e lista com detalhes do material e localização.',
    code: `import 'dart:io';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/waste_point.dart';

/// Card para detalhar um registro de resíduo
class WastePointCard extends StatelessWidget {
  final WastePoint point;
  final VoidCallback? onTap;

  const WastePointCard({
    super.key,
    required this.point,
    this.onTap,
  });

  Color _getStatusColor() {
    switch (point.tipoPonto) {
      case 'Ecoponto':
      case 'Ponto adequado':
        return const Color(0xFF2E7D32); // Verde
      case 'Descarte irregular':
        return const Color(0xFFD32F2F); // Vermelho
      default:
        return const Color(0xFFF57C00); // Amarelo/Laranja (Aguardando verificação)
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor();
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (point.isDemo)
                Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'DADO DE DEMONSTRAÇÃO',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF92400E),
                    ),
                  ),
                ),
              Row(
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: statusColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      point.tipoPonto,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: statusColor,
                      ),
                    ),
                  ),
                  Text(
                    dateFormat.format(point.dataHora),
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Material: \${point.materialPredominante}',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF2E7D32),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Misto: \${point.residuoMisto}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF475569),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                point.observacao,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 13, color: Color(0xFF334155)),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined,
                      size: 16, color: Color(0xFF64748B)),
                  const SizedBox(width: 4),
                  Text(
                    '\${point.latitude.toStringAsFixed(4)}, \${point.longitude.toStringAsFixed(4)} (Riacho Fundo I)',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/home_screen.dart',
    language: 'dart',
    description: 'Tela inicial limpa e profissional com identidade visual ecológica e botões de acesso.',
    code: `import 'package:flutter/material.dart';
import 'about_screen.dart';
import 'ecopoints_screen.dart';

/// Tela Inicial do EcoMapa DF
class HomeScreen extends StatelessWidget {
  final Function(int) onNavigateToTab;

  const HomeScreen({
    super.key,
    required this.onNavigateToTab,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.eco, color: Color(0xFF2E7D32)),
            SizedBox(width: 8),
            Text(
              'EcoMapa DF',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            tooltip: 'Sobre o projeto',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AboutScreen()),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Banner de Identidade Visual
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1B5E20), Color(0xFF2E7D32)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF2E7D32).withOpacity(0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'CIÊNCIA CIDADÃ • RIACHO FUNDO I',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'EcoMapa DF',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Mapeando resíduos. Construindo soluções.',
                    style: TextStyle(
                      color: Color(0xFFE8F5E9),
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Ajude a identificar, registrar e monitorar pontos de descarte de resíduos no Distrito Federal. Conecte dados de campo à Ciência e Engenharia de Materiais.',
                    style: TextStyle(
                      color: Color(0xFFC8E6C9),
                      fontSize: 13,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            const Text(
              'Acesso Rápido',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 14),

            // Botão 1: Ver Mapa
            _buildActionCard(
              title: 'Ver mapa',
              subtitle: 'Visualize pontos de descarte e ecopontos no mapa',
              icon: Icons.map_outlined,
              color: const Color(0xFF2E7D32),
              onTap: () => onNavigateToTab(1), // Aba Mapa
            ),
            const SizedBox(height: 12),

            // Botão 2: Registrar Ponto
            _buildActionCard(
              title: 'Registrar ponto',
              subtitle: 'Georreferencie e classifique resíduos com fotos',
              icon: Icons.add_location_alt_outlined,
              color: const Color(0xFF15803D),
              onTap: () => onNavigateToTab(2), // Aba Registrar
            ),
            const SizedBox(height: 12),

            // Botão 3: Ecopontos
            _buildActionCard(
              title: 'Ecopontos',
              subtitle: 'Locais adequados de descarte e Papa-Entulho no DF',
              icon: Icons.recycling_outlined,
              color: const Color(0xFF0284C7),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const EcopointsScreen()),
                );
              },
            ),
            const SizedBox(height: 12),

            // Botão 4: Estatísticas
            _buildActionCard(
              title: 'Estatísticas',
              subtitle: 'Gráficos por categoria de material e descarte',
              icon: Icons.bar_chart_outlined,
              color: const Color(0xFFD97706),
              onTap: () => onNavigateToTab(3), // Aba Estatísticas
            ),
            const SizedBox(height: 12),

            // Botão 5: Sobre o Projeto
            _buildActionCard(
              title: 'Sobre o projeto',
              subtitle: 'Objetivos científicos e impacto comunitário',
              icon: Icons.menu_book_outlined,
              color: const Color(0xFF475569),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const AboutScreen()),
                );
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      color: Colors.white,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 26),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios,
                  size: 16, color: Color(0xFF94A3B8)),
            ],
          ),
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/map_screen.dart',
    language: 'dart',
    description: 'Tela de mapa interativo com OpenStreetMap, marcadores coloridos e visualização de ponto.',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../models/waste_point.dart';
import '../services/storage_service.dart';
import '../services/location_service.dart';
import '../data/demo_data.dart';
import 'package:intl/intl.dart';

/// Tela do Mapa com marcadores georreferenciados
class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();
  List<WastePoint> _points = [];
  bool _isLoading = true;
  LatLng _currentCenter = const LatLng(AppConstants.riachoFundoLat, AppConstants.riachoFundoLng);
  LatLng? _userPosition;

  @override
  void initState() {
    super.initState();
    _loadPoints();
  }

  Future<void> _loadPoints() async {
    setState(() => _isLoading = true);
    final points = await StorageService.loadWastePoints();
    setState(() {
      _points = points;
      _isLoading = false;
    });
  }

  Future<void> _goToUserLocation() async {
    final result = await LocationService.getCurrentLocation();
    if (!mounted) return;

    if (result.isSuccess && result.position != null) {
      final userLatLng = LatLng(
        result.position!.latitude,
        result.position!.longitude,
      );
      setState(() {
        _userPosition = userLatLng;
      });
      _mapController.move(userLatLng, 15.0);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Localização obtida com sucesso!'),
          backgroundColor: Color(0xFF2E7D32),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.errorMessage ?? 'Não foi possível obter localização.'),
          backgroundColor: const Color(0xFFD32F2F),
        ),
      );
    }
  }

  Color _getMarkerColor(WastePoint point) {
    if (point.tipoPonto == 'Ecoponto' || point.tipoPonto == 'Ponto adequado') {
      return const Color(0xFF2E7D32); // VERDE: Ponto adequado / ecoponto
    } else if (point.tipoPonto == 'Descarte irregular') {
      return const Color(0xFFD32F2F); // VERMELHO: Descarte irregular
    } else {
      return const Color(0xFFF57C00); // AMARELO/LARANJA: Ponto aguardando verificação
    }
  }

  void _showPointDetails(WastePoint point) {
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');
    final color = _getMarkerColor(point);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              if (point.isDemo)
                Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'DADO DE DEMONSTRAÇÃO (EXEMPLO)',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF92400E),
                    ),
                  ),
                ),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(Icons.location_on, color: color, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          point.tipoPonto,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: color,
                          ),
                        ),
                        Text(
                          'Status: \${point.status.toUpperCase()}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.grey.shade700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),
              _detailRow('Categoria do resíduo:', point.categoriaResiduo),
              _detailRow('Material predominante:', point.materialPredominante),
              _detailRow('Resíduo misto?', point.residuoMisto),
              _detailRow('Data e hora:', dateFormat.format(point.dataHora)),
              _detailRow('Coordenadas:', '\${point.latitude.toStringAsFixed(5)}, \${point.longitude.toStringAsFixed(5)}'),
              const SizedBox(height: 10),
              const Text(
                'Observação:',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                point.observacao.isEmpty ? 'Sem observações adicionais.' : point.observacao,
                style: const TextStyle(fontSize: 13, color: Color(0xFF334155)),
              ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 160,
            child: Text(
              label,
              style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Color(0xFF0F172A),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mapa de Resíduos (DF)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Atualizar pontos',
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
                  options: MapOptions(
                    initialCenter: _currentCenter,
                    initialZoom: 14.5,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.ecomapa.df',
                    ),
                    MarkerLayer(
                      markers: [
                        // Marcador da posição atual do usuário (se obtida)
                        if (_userPosition != null)
                          Marker(
                            point: _userPosition!,
                            width: 50,
                            height: 50,
                            child: const Icon(
                              Icons.my_location,
                              color: Colors.blueAccent,
                              size: 32,
                            ),
                          ),
                        // Marcadores de descarte
                        ..._points.map((p) {
                          final color = _getMarkerColor(p);
                          return Marker(
                            point: LatLng(p.latitude, p.longitude),
                            width: 44,
                            height: 44,
                            child: GestureDetector(
                              onTap: () => _showPointDetails(p),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: color,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 2.5),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.2),
                                      blurRadius: 6,
                                      offset: const Offset(0, 3),
                                    ),
                                  ],
                                ),
                                child: const Icon(
                                  Icons.delete_outline,
                                  color: Colors.white,
                                  size: 22,
                                ),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ],
                ),

                // Legenda flutuante no topo
                Positioned(
                  top: 12,
                  left: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.95),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _legendItem('Adequado', const Color(0xFF2E7D32)),
                        _legendItem('Irregular', const Color(0xFFD32F2F)),
                        _legendItem('Em análise', const Color(0xFFF57C00)),
                      ],
                    ),
                  ),
                ),

                // Botão flutuante para centralizar no GPS
                Positioned(
                  bottom: 20,
                  right: 16,
                  child: FloatingActionButton.extended(
                    heroTag: 'map_gps_btn',
                    onPressed: _goToUserLocation,
                    backgroundColor: const Color(0xFF2E7D32),
                    icon: const Icon(Icons.my_location, color: Colors.white),
                    label: const Text(
                      'Minha Posição',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _legendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
`,
  },
  {
    path: 'lib/screens/register_screen.dart',
    language: 'dart',
    description: 'Tela de registro de novo ponto com validação, câmera/galeria, GPS e classificação de materiais.',
    code: `import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../models/waste_point.dart';
import '../services/location_service.dart';
import '../services/storage_service.dart';
import '../data/demo_data.dart';

/// Tela "Registrar ponto"
class RegisterScreen extends StatefulWidget {
  final VoidCallback? onPointSaved;

  const RegisterScreen({super.key, this.onPointSaved});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _obsController = TextEditingController();

  // Estados dos campos
  String _selectedTipoPonto = 'Descarte irregular';
  String _selectedCategoria = 'Plástico';
  String _selectedMaterialPredominante = 'Plástico';
  String _selectedResiduoMisto = 'Não identificado';

  double? _latitude;
  double? _longitude;
  bool _isLoadingGps = false;
  String? _gpsStatusMessage;

  File? _imageFile;
  final ImagePicker _picker = ImagePicker();
  bool _isSaving = false;

  @override
  void dispose() {
    _obsController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? picked = await _picker.pickImage(
        source: source,
        maxWidth: 1200,
        imageQuality: 80,
      );
      if (picked != null) {
        setState(() {
          _imageFile = File(picked.path);
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Não foi possível carregar a imagem: \${e.toString()}'),
          backgroundColor: const Color(0xFFD32F2F),
        ),
      );
    }
  }

  Future<void> _getLocation() async {
    setState(() {
      _isLoadingGps = true;
      _gpsStatusMessage = null;
    });

    final result = await LocationService.getCurrentLocation();

    if (!mounted) return;
    setState(() {
      _isLoadingGps = false;
      if (result.isSuccess && result.position != null) {
        _latitude = result.position!.latitude;
        _longitude = result.position!.longitude;
        _gpsStatusMessage = 'Localização obtida com sucesso!';
      } else {
        _gpsStatusMessage = result.errorMessage ?? 'Erro ao obter localização.';
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_gpsStatusMessage!),
        backgroundColor:
            result.isSuccess ? const Color(0xFF2E7D32) : const Color(0xFFD32F2F),
      ),
    );
  }

  void _showImageSourceDialog() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Adicionar Fotografia',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                ListTile(
                  leading: const Icon(Icons.camera_alt, color: Color(0xFF2E7D32)),
                  title: const Text('Tirar fotografia pela câmera'),
                  onTap: () {
                    Navigator.pop(context);
                    _pickImage(ImageSource.camera);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.photo_library, color: Color(0xFF2E7D32)),
                  title: const Text('Selecionar imagem da galeria'),
                  onTap: () {
                    Navigator.pop(context);
                    _pickImage(ImageSource.gallery);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _savePoint() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_latitude == null || _longitude == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Por favor, obtenha a localização GPS antes de salvar o ponto.',
          ),
          backgroundColor: Color(0xFFD32F2F),
        ),
      );
      return;
    }

    setState(() => _isSaving = true);

    final newPoint = WastePoint(
      id: 'point-\${DateTime.now().millisecondsSinceEpoch}',
      latitude: _latitude!,
      longitude: _longitude!,
      tipoPonto: _selectedTipoPonto,
      categoriaResiduo: _selectedCategoria,
      materialPredominante: _selectedMaterialPredominante,
      residuoMisto: _selectedResiduoMisto,
      imagem: _imageFile?.path,
      observacao: _obsController.text.trim(),
      dataHora: DateTime.now(),
      status: 'pendente',
      isDemo: false,
    );

    final success = await StorageService.addWastePoint(newPoint);

    if (!mounted) return;
    setState(() => _isSaving = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Ponto salvo com sucesso no EcoMapa DF!'),
          backgroundColor: Color(0xFF2E7D32),
        ),
      );
      // Limpa formulário
      setState(() {
        _latitude = null;
        _longitude = null;
        _imageFile = null;
        _obsController.clear();
        _selectedTipoPonto = 'Descarte irregular';
        _selectedCategoria = 'Plástico';
        _selectedMaterialPredominante = 'Plástico';
        _selectedResiduoMisto = 'Não identificado';
        _gpsStatusMessage = null;
      });
      widget.onPointSaved?.call();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Falha ao salvar o ponto. Tente novamente.'),
          backgroundColor: Color(0xFFD32F2F),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Registrar Ponto'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. TIPO DO PONTO
              _buildSectionTitle('1. Tipo do Ponto'),
              DropdownButtonFormField<String>(
                value: _selectedTipoPonto,
                decoration: _inputDecoration('Selecione o tipo do ponto'),
                items: MaterialCategories.pointTypes.map((t) {
                  return DropdownMenuItem(value: t, child: Text(t));
                }).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedTipoPonto = val);
                },
              ),
              const SizedBox(height: 20),

              // 2. CATEGORIA DO RESÍDUO
              _buildSectionTitle('2. Categoria do Resíduo'),
              DropdownButtonFormField<String>(
                value: _selectedCategoria,
                decoration: _inputDecoration('Categoria geral'),
                items: MaterialCategories.list.map((c) {
                  return DropdownMenuItem(value: c, child: Text(c));
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _selectedCategoria = val;
                      _selectedMaterialPredominante = val;
                    });
                  }
                },
              ),
              const SizedBox(height: 20),

              // 3. MATERIAL PREDOMINANTE (Ciência dos Materiais)
              _buildSectionTitle('3. Material Predominante (Ciência dos Materiais)'),
              const Text(
                'Classifique o material com maior volume ou peso na amostra de descarte.',
                style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedMaterialPredominante,
                decoration: _inputDecoration('Material predominante'),
                items: MaterialCategories.list.map((m) {
                  return DropdownMenuItem(value: m, child: Text(m));
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    setState(() => _selectedMaterialPredominante = val);
                  }
                },
              ),
              const SizedBox(height: 20),

              // 4. RESÍDUO MISTO
              _buildSectionTitle('4. É resíduo misto?'),
              Row(
                children: MaterialCategories.mixedOptions.map((opt) {
                  final isSelected = _selectedResiduoMisto == opt;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: ChoiceChip(
                        label: Text(opt),
                        selected: isSelected,
                        selectedColor: const Color(0xFFE8F5E9),
                        labelStyle: TextStyle(
                          color: isSelected
                              ? const Color(0xFF1B5E20)
                              : const Color(0xFF475569),
                          fontWeight:
                              isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                        onSelected: (selected) {
                          if (selected) {
                            setState(() => _selectedResiduoMisto = opt);
                          }
                        },
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),

              // 5. FOTOGRAFIA
              _buildSectionTitle('5. Fotografia do Descarte'),
              if (_imageFile != null) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.file(
                    _imageFile!,
                    height: 180,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                      label: const Text('Remover foto',
                          style: TextStyle(color: Colors.red)),
                      onPressed: () => setState(() => _imageFile = null),
                    ),
                  ],
                ),
              ] else
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  icon: const Icon(Icons.add_a_photo_outlined,
                      color: Color(0xFF2E7D32)),
                  label: const Text(
                    'Adicionar fotografia',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF2E7D32),
                    ),
                  ),
                  onPressed: _showImageSourceDialog,
                ),
              const SizedBox(height: 20),

              // 6. LOCALIZAÇÃO GPS
              _buildSectionTitle('6. Localização GPS'),
              if (_latitude != null && _longitude != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFA5D6A7)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle,
                          color: Color(0xFF2E7D32), size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Lat: \${_latitude!.toStringAsFixed(5)}, Lng: \${_longitude!.toStringAsFixed(5)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1B5E20),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                icon: _isLoadingGps
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.my_location, color: Color(0xFF2E7D32)),
                label: Text(
                  _isLoadingGps
                      ? 'Obtendo GPS...'
                      : (_latitude == null
                          ? 'Obter minha localização'
                          : 'Atualizar localização GPS'),
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF2E7D32),
                  ),
                ),
                onPressed: _isLoadingGps ? null : _getLocation,
              ),
              const SizedBox(height: 20),

              // 7. OBSERVAÇÃO
              _buildSectionTitle('7. Observação Livre'),
              TextFormField(
                controller: _obsController,
                maxLines: 3,
                decoration: _inputDecoration(
                  'Descreva o estado do material, volume aproximado, pontos de referência...',
                ),
              ),
              const SizedBox(height: 20),

              // 8. DATA E HORA
              _buildSectionTitle('8. Data e Hora'),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined,
                        size: 18, color: Color(0xFF64748B)),
                    const SizedBox(width: 10),
                    Text(
                      'Preenchido automaticamente: \${dateFormat.format(DateTime.now())}',
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF475569),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),

              // BOTÃO SALVAR
              FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF2E7D32),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                onPressed: _isSaving ? null : _savePoint,
                child: _isSaving
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'Salvar ponto',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.bold,
          color: Color(0xFF0F172A),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF2E7D32), width: 1.5),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/statistics_screen.dart',
    language: 'dart',
    description: 'Tela de estatísticas com totalizadores, descartes irregulares e gráficos de materiais.',
    code: `import 'package:flutter/material.dart';
import '../models/waste_point.dart';
import '../services/storage_service.dart';
import '../widgets/statistic_card.dart';

/// Tela de Estatísticas do EcoMapa DF
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
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final list = await StorageService.loadWastePoints();
    setState(() {
      _points = list;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    // Cálculos estatísticos em tempo real
    final int total = _points.length;
    final int irregularCount =
        _points.where((p) => p.tipoPonto == 'Descarte irregular').length;
    final int adequateCount = _points
        .where((p) => p.tipoPonto == 'Ponto adequado' || p.tipoPonto == 'Ecoponto')
        .length;
    final int mixedCount = _points.where((p) => p.residuoMisto == 'Sim').length;

    // Contagem por categoria de material predominante
    final Map<String, int> materialCount = {};
    for (var p in _points) {
      final mat = p.materialPredominante;
      materialCount[mat] = (materialCount[mat] ?? 0) + 1;
    }

    // Ordena materiais por maior frequência
    final sortedMaterials = materialCount.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Estatísticas dos Registros'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Resumo Geral',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Cards de métricas principais em Grid
                  Row(
                    children: [
                      Expanded(
                        child: MetricCard(
                          title: 'Total de Registros',
                          value: total.toString(),
                          icon: Icons.assignment_outlined,
                          color: const Color(0xFF2E7D32),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: MetricCard(
                          title: 'Descartes Irregulares',
                          value: irregularCount.toString(),
                          icon: Icons.warning_amber_rounded,
                          color: const Color(0xFFD32F2F),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: MetricCard(
                          title: 'Pontos Adequados',
                          value: adequateCount.toString(),
                          icon: Icons.check_circle_outline,
                          color: const Color(0xFF0284C7),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: MetricCard(
                          title: 'Resíduos Mistos',
                          value: mixedCount.toString(),
                          icon: Icons.layers_outlined,
                          color: const Color(0xFFD97706),
                          subtitle: total > 0
                              ? '\${((mixedCount / total) * 100).round()}% do total'
                              : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 28),

                  // Gráfico de Materiais Encontrados (Ciência dos Materiais)
                  const Text(
                    'Materiais Predominantes Encontrados',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Análise de frequência de categorias para caracterização de impacto e reciclagem.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 16),

                  Card(
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide(color: Colors.grey.shade200),
                    ),
                    color: Colors.white,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: sortedMaterials.isEmpty
                          ? const Center(
                              child: Text('Nenhum registro encontrado.'),
                            )
                          : Column(
                              children: sortedMaterials.map((entry) {
                                return MaterialBarItem(
                                  label: entry.key,
                                  count: entry.value,
                                  total: total,
                                  color: _getColorForMaterial(entry.key),
                                );
                              }).toList(),
                            ),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
    );
  }

  Color _getColorForMaterial(String material) {
    switch (material) {
      case 'Plástico':
        return const Color(0xFF2563EB); // Azul
      case 'Resíduo de construção':
        return const Color(0xFF78350F); // Marrom escuro
      case 'Vidro':
        return const Color(0xFF0D9488); // Verde petróleo
      case 'Metal':
        return const Color(0xFF64748B); // Aço / Cinza
      case 'Papel/Papelão':
        return const Color(0xFFD97706); // Âmbar
      case 'Madeira':
        return const Color(0xFFB45309);
      case 'Resíduo eletrônico':
        return const Color(0xFF7C3AED); // Roxo
      case 'Resíduo orgânico':
        return const Color(0xFF15803D); // Verde folha
      default:
        return const Color(0xFF2E7D32);
    }
  }
}
`,
  },
  {
    path: 'lib/screens/ecopoints_screen.dart',
    language: 'dart',
    description: 'Tela "Ecopontos" com lista de locais adequados, materiais aceitos e dados oficiais do SLU.',
    code: `import 'package:flutter/material.dart';
import '../data/demo_data.dart';

/// Tela "Ecopontos" - Locais adequados de descarte no DF
class EcopointsScreen extends StatelessWidget {
  const EcopointsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ecopontos no DF'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: demoEcopointsList.length,
        itemBuilder: (context, index) {
          final eco = demoEcopointsList[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: Colors.grey.shade200),
            ),
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.recycling,
                          color: Color(0xFF2E7D32),
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              eco.nome,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              eco.regiao,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF2E7D32),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '~ \${eco.distanciaKm.toStringAsFixed(1)} km',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF475569),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.location_on_outlined,
                          size: 16, color: Color(0xFF64748B)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          eco.endereco,
                          style: const TextStyle(
                              fontSize: 13, color: Color(0xFF475569)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.access_time,
                          size: 16, color: Color(0xFF64748B)),
                      const SizedBox(width: 6),
                      Text(
                        eco.horario,
                        style: const TextStyle(
                            fontSize: 12, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                  const Divider(height: 20),
                  const Text(
                    'Materiais aceitos:',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: eco.materiais.map((mat) {
                      return Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          mat,
                          style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFF334155),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/about_screen.dart',
    language: 'dart',
    description: 'Tela "Sobre o projeto" detalhando a Ciência Cidadã, Ciência dos Materiais e Riacho Fundo I.',
    code: `import 'package:flutter/material.dart';

/// Tela explicativa sobre o projeto EcoMapa DF
class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sobre o Projeto'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                children: [
                  Icon(Icons.science, color: Color(0xFF1B5E20), size: 36),
                  SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      'O EcoMapa DF é uma iniciativa de ciência cidadã voltada ao registro e monitoramento de pontos de descarte de resíduos.',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1B5E20),
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'Objetivos da Iniciativa',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 12),
            _buildGoalItem(
              Icons.school_outlined,
              'Contribuir para a educação ambiental e conscientização urbana.',
            ),
            _buildGoalItem(
              Icons.pin_drop_outlined,
              'Gerar dados georreferenciados precisos para planejamento público.',
            ),
            _buildGoalItem(
              Icons.analytics_outlined,
              'Identificar padrões espaciais e temporais de descarte irregular.',
            ),
            _buildGoalItem(
              Icons.category_outlined,
              'Estudar a ocorrência e persistência de diferentes classes de materiais.',
            ),
            _buildGoalItem(
              Icons.handshake_outlined,
              'Apoiar ações ambientais locais e organizações comunitárias.',
            ),
            _buildGoalItem(
              Icons.devices_other_outlined,
              'Aproximar tecnologia, pesquisa científica e comunidade.',
            ),

            const SizedBox(height: 24),
            const Text(
              'Área Piloto de Estudo',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: const Text(
                'A primeira região de atuação e validação metodológica é a Região Administrativa do Riacho Fundo I (DF). Com o avanço das coletas comunitárias, a malha de monitoramento será expandida para outras regiões do Distrito Federal.',
                style: TextStyle(fontSize: 14, color: Color(0xFF334155), height: 1.5),
              ),
            ),

            const SizedBox(height: 24),
            const Text(
              'Conexão com Ciência dos Materiais',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: const Text(
                'A classificação de materiais (polímeros, metais, cerâmicos/construção civil, vidros, celulose) permite compreender os ciclos de vida, degradabilidade e viabilidade de reciclagem ou reuso, fundamentando políticas sustentáveis no DF.',
                style: TextStyle(fontSize: 14, color: Color(0xFF334155), height: 1.5),
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildGoalItem(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 20, color: const Color(0xFF2E7D32)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14, color: Color(0xFF334155)),
            ),
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/main.dart',
    language: 'dart',
    description: 'Ponto de entrada do aplicativo com Material 3, tema verde/ecológico e NavigationBar.',
    code: `import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/map_screen.dart';
import 'screens/register_screen.dart';
import 'screens/statistics_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const EcoMapaDfApp());
}

/// Aplicativo Principal EcoMapa DF
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
          seedColor: const Color(0xFF2E7D32), // Verde ecológico
          primary: const Color(0xFF2E7D32),
          secondary: const Color(0xFF15803D),
          background: const Color(0xFFF8FAFC),
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

/// Estrutura de Navegação com Material 3 NavigationBar (4 abas principais)
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
      RegisterScreen(
        onPointSaved: () {
          // Após salvar, leva o usuário diretamente para o mapa
          _onNavigateToTab(1);
        },
      ),
      const StatisticsScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
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
            selectedIcon:
                Icon(Icons.add_location_alt, color: Color(0xFF1B5E20)),
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
`,
  },
  {
    path: '.github/workflows/build_apk.yml',
    language: 'yaml',
    description: 'Automação no GitHub (GitHub Actions) que compila e gera o arquivo .APK instalável grátis na nuvem.',
    code: `name: Compilar APK EcoMapa DF

on:
  push:
    branches: [ main, master ]
  workflow_dispatch: # Permite acionar o botão de compilação manualmente no GitHub

jobs:
  build:
    name: Gerar APK Android
    runs-on: ubuntu-latest

    steps:
      - name: Baixar código do repositório
        uses: actions/checkout@v4

      - name: Configurar Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Configurar Flutter SDK
        uses: subosito/flutter-action@v2
        with:
          channel: 'stable'
          cache: true

      - name: Garantir arquivos nativos do Android
        run: |
          sed -i 's/intl:.*/intl: any/g' pubspec.yaml || true
          flutter create --no-pub --platforms=android --org com.ecomapa .
          flutter pub get
          chmod +x android/gradlew || true
          yes | flutter doctor --android-licenses || true

      - name: Compilar APK Release (Instalador Android)
        run: flutter build apk --release --no-tree-shake-icons

      - name: Disponibilizar APK para Download
        uses: actions/upload-artifact@v4
        with:
          name: EcoMapa-DF-Instalador
          path: build/app/outputs/flutter-apk/app-release.apk
`,
  },
];
