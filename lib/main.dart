name: Gerar APK Android EcoMapa DF

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

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

      - name: Garantir arquivos nativos do Android e Dependências
        run: |
          # Se o projeto foi enviado em ZIP, descompacta automaticamente
          for z in *.zip; do
            if [ -f "$z" ]; then
              echo "Descompactando $z automaticamente..."
              unzip -o "$z" || true
            fi
          done

          # Se os arquivos estiverem em uma subpasta, move para a raiz
          if [ ! -d "lib" ]; then
            SUBDIR=$(find . -maxdepth 2 -type d -name "lib" | head -n 1 | sed 's|/lib||')
            if [ -n "$SUBDIR" ] && [ "$SUBDIR" != "." ]; then
              echo "Movendo arquivos de $SUBDIR para a raiz..."
              cp -rn "$SUBDIR"/* . || true
            fi
          fi

          # Garante o nome correto no pubspec.yaml
          sed -i 's/^name:.*/name: ecomapa_df/g' pubspec.yaml 2>/dev/null || true

          # Inicializa a estrutura nativa Android
          flutter create --no-pub --platforms=android --org com.ecomapa --project-name ecomapa_df .

          # Instala automaticamente todas as dependências necessárias do EcoMapa DF
          flutter pub add flutter_map latlong2 geolocator image_picker shared_preferences intl

          # Ajusta o minSdk para 21 e compileSdk para 34 (obrigatório para GPS e Câmera)
          sed -i 's/flutter.minSdkVersion/21/g' android/app/build.gradle* 2>/dev/null || true
          sed -i 's/minSdk = .*/minSdk = 21/g' android/app/build.gradle* 2>/dev/null || true
          sed -i 's/minSdkVersion .*/minSdkVersion 21/g' android/app/build.gradle* 2>/dev/null || true
          sed -i 's/flutter.compileSdkVersion/34/g' android/app/build.gradle* 2>/dev/null || true
          sed -i 's/compileSdk = .*/compileSdk = 34/g' android/app/build.gradle* 2>/dev/null || true
          sed -i 's/compileSdkVersion .*/compileSdkVersion 34/g' android/app/build.gradle* 2>/dev/null || true

          # Injeta permissões de GPS e Câmera no AndroidManifest.xml
          sed -i '/<application/i \    <uses-permission android:name="android.permission.INTERNET"/>\n    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>\n    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>\n    <uses-permission android:name="android.permission.CAMERA"/>' android/app/src/main/AndroidManifest.xml 2>/dev/null || true

          chmod +x android/gradlew || true
          yes | flutter doctor --android-licenses || true

      - name: Compilar APK Release (Instalador Android)
        run: flutter build apk --release --no-tree-shake-icons

      - name: Disponibilizar APK para Download
        uses: actions/upload-artifact@v4
        with:
          name: EcoMapa-DF-Instalador
          path: build/app/outputs/flutter-apk/app-release.apk
