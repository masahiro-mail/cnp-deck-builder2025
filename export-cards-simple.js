// シンプルなカードデータCSV出力スクリプト

const fs = require('fs');
const path = require('path');

// 手動でカードデータを読み込んでCSVに変換
async function exportCardsToCSV() {
  try {
    console.log('カードデータを読み込み中...');
    
    // cards.tsファイルを文字列として読み込み
    const cardsFilePath = path.join(__dirname, 'data', 'cards.ts');
    const fileContent = fs.readFileSync(cardsFilePath, 'utf-8');
    
    // 正規表現でカードオブジェクトを抽出
    const cardMatches = fileContent.match(/\{[^}]*(?:\{[^}]*\}[^}]*)*\}/g);
    
    if (!cardMatches) {
      throw new Error('カードデータが見つかりませんでした');
    }
    
    console.log(`${cardMatches.length}個のカードオブジェクトを検出しました`);
    
    // CSVヘッダーを定義
    const csvHeaders = [
      'id',
      'name', 
      'type',
      'cost',
      'bp',
      'sp',
      'ability',
      'description',
      'faction',
      'illustrator',
      'imageUrl',
      'color',
      'rarity',
      'cardNumber',
      'colorBalance',
      'colorCost',
      'colorlessCost',
      'effectType',
      'pack',
      'traits',
      'effect',
      'flavorText'
    ];
    
    // CSVコンテンツを初期化
    let csvContent = csvHeaders.join(',') + '\n';
    
    // 各カードオブジェクトを解析
    const cards = [];
    let validCardCount = 0;
    
    for (const cardMatch of cardMatches) {
      try {
        // 簡易的なプロパティ抽出（正規表現ベース）
        const card = {};
        
        // idを抽出
        const idMatch = cardMatch.match(/id:\s*["']([^"']+)["']/);
        if (idMatch) {
          card.id = idMatch[1];
          
          // 他のプロパティも抽出
          const nameMatch = cardMatch.match(/name:\s*["']([^"']+)["']/);
          const typeMatch = cardMatch.match(/type:\s*["']([^"']+)["']/);
          const costMatch = cardMatch.match(/cost:\s*(\d+)/);
          const bpMatch = cardMatch.match(/bp:\s*["']([^"']+)["']/);
          const spMatch = cardMatch.match(/sp:\s*["']([^"']+)["']/);
          const abilityMatch = cardMatch.match(/ability:\s*["']([^"']*?)["'](?=\s*,|\s*description|\s*faction|\s*illustrator|\s*imageUrl|\s*color|\s*rarity|\s*})/);
          const descriptionMatch = cardMatch.match(/description:\s*["']([^"']*?)["'](?=\s*,|\s*faction|\s*illustrator|\s*imageUrl|\s*color|\s*rarity|\s*})/);
          const factionMatch = cardMatch.match(/faction:\s*["']([^"']+)["']/);
          const illustratorMatch = cardMatch.match(/illustrator:\s*["']([^"']+)["']/);
          const imageUrlMatch = cardMatch.match(/imageUrl:\s*["']([^"']+)["']/);
          const colorMatch = cardMatch.match(/color:\s*["']([^"']+)["']/);
          const rarityMatch = cardMatch.match(/rarity:\s*["']([^"']+)["']/);
          const cardNumberMatch = cardMatch.match(/cardNumber:\s*["']([^"']+)["']/);
          const colorBalanceMatch = cardMatch.match(/colorBalance:\s*["']([^"']+)["']/);
          const colorCostMatch = cardMatch.match(/colorCost:\s*(\d+)/);
          const colorlessCostMatch = cardMatch.match(/colorlessCost:\s*(\d+)/);
          const packMatch = cardMatch.match(/pack:\s*["']([^"']+)["']/);
          
          // 配列プロパティの抽出（traits, effectType）
          const traitsMatch = cardMatch.match(/traits:\s*\[([^\]]*)\]/);
          const effectTypeMatch = cardMatch.match(/effectType:\s*\[([^\]]*)\]/);
          const effectMatch = cardMatch.match(/effect:\s*["']([^"']*?)["'](?=\s*,|\s*flavorText|\s*})/);
          const flavorTextMatch = cardMatch.match(/flavorText:\s*["']([^"']*?)["'](?=\s*,|\s*})/);
          
          card.name = nameMatch ? nameMatch[1] : '';
          card.type = typeMatch ? typeMatch[1] : '';
          card.cost = costMatch ? parseInt(costMatch[1]) : '';
          card.bp = bpMatch ? bpMatch[1] : '';
          card.sp = spMatch ? spMatch[1] : '';
          card.ability = abilityMatch ? abilityMatch[1] : '';
          card.description = descriptionMatch ? descriptionMatch[1] : '';
          card.faction = factionMatch ? factionMatch[1] : '';
          card.illustrator = illustratorMatch ? illustratorMatch[1] : '';
          card.imageUrl = imageUrlMatch ? imageUrlMatch[1] : '';
          card.color = colorMatch ? colorMatch[1] : '';
          card.rarity = rarityMatch ? rarityMatch[1] : '';
          card.cardNumber = cardNumberMatch ? cardNumberMatch[1] : '';
          card.colorBalance = colorBalanceMatch ? colorBalanceMatch[1] : '';
          card.colorCost = colorCostMatch ? parseInt(colorCostMatch[1]) : '';
          card.colorlessCost = colorlessCostMatch ? parseInt(colorlessCostMatch[1]) : '';
          card.pack = packMatch ? packMatch[1] : '';
          card.effect = effectMatch ? effectMatch[1] : '';
          card.flavorText = flavorTextMatch ? flavorTextMatch[1] : '';
          
          // 配列データの処理
          if (traitsMatch) {
            const traitsStr = traitsMatch[1].replace(/["']/g, '').replace(/\s/g, '');
            card.traits = traitsStr ? traitsStr.split(',').join(';') : '';
          } else {
            card.traits = '';
          }
          
          if (effectTypeMatch) {
            const effectTypeStr = effectTypeMatch[1].replace(/["']/g, '').replace(/\s/g, '');
            card.effectType = effectTypeStr ? effectTypeStr.split(',').join(';') : '';
          } else {
            card.effectType = '';
          }
          
          cards.push(card);
          validCardCount++;
        }
      } catch (e) {
        console.log(`カード解析エラー (スキップ): ${e.message}`);
      }
    }
    
    console.log(`有効なカードデータ: ${validCardCount}枚`);
    
    // CSVデータを構築
    cards.forEach(card => {
      const row = csvHeaders.map(header => {
        let value = card[header];
        
        // undefinedやnullの場合は空文字に
        if (value === undefined || value === null) {
          value = '';
        }
        
        // 文字列の場合はCSV用にエスケープ
        if (typeof value === 'string') {
          // ダブルクォートをエスケープ
          value = value.replace(/"/g, '""');
          // カンマ、改行、ダブルクォートが含まれる場合はダブルクォートで囲む
          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            value = `"${value}"`;
          }
        }
        
        return value;
      });
      
      csvContent += row.join(',') + '\n';
    });
    
    // CSVファイルを保存
    const csvOutputPath = path.join(__dirname, 'cards_export.csv');
    fs.writeFileSync(csvOutputPath, csvContent, 'utf-8');
    
    console.log(`\nCSVファイルを正常に出力しました: ${csvOutputPath}`);
    console.log(`出力されたカード数: ${validCardCount}枚`);
    
    // 統計情報を表示
    const stats = {
      totalCards: validCardCount,
      byType: {},
      byColor: {},
      byRarity: {},
      byPack: {}
    };
    
    cards.forEach(card => {
      // タイプ別
      if (card.type) {
        stats.byType[card.type] = (stats.byType[card.type] || 0) + 1;
      }
      
      // 色別
      if (card.color) {
        stats.byColor[card.color] = (stats.byColor[card.color] || 0) + 1;
      }
      
      // レアリティ別
      if (card.rarity) {
        stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1;
      }
      
      // パック別
      if (card.pack) {
        stats.byPack[card.pack] = (stats.byPack[card.pack] || 0) + 1;
      }
    });
    
    console.log('\n=== カード統計 ===');
    console.log('総カード数:', stats.totalCards);
    console.log('\nタイプ別:');
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}枚`);
    });
    console.log('\n色別:');
    Object.entries(stats.byColor).forEach(([color, count]) => {
      console.log(`  ${color}: ${count}枚`);
    });
    console.log('\nレアリティ別:');
    Object.entries(stats.byRarity).forEach(([rarity, count]) => {
      console.log(`  ${rarity}: ${count}枚`);
    });
    console.log('\nパック別:');
    Object.entries(stats.byPack).forEach(([pack, count]) => {
      console.log(`  ${pack}: ${count}枚`);
    });
    
  } catch (error) {
    console.error('CSV出力中にエラーが発生しました:', error);
  }
}

// スクリプトを実行
exportCardsToCSV();