-- 図解師★ウルフのユーザーIDを確認
SELECT id, x_username, x_name FROM users WHERE x_username = 'Diagram_Wolf';

-- 推奨デッキを公開デッキとして追加
-- （user_idは上記で確認したIDに置き換えてください）

INSERT INTO saved_decks (user_id, deck_name, deck_id, cards, raiki_cards, is_public, description, created_at, updated_at)
VALUES 
  -- ゆーきまるさん(2025/05/10)🟥15
  (1, 'ゆーきまるさん(2025/05/10)🟥15', 'btaaaaeaavaaaaaaazvqaxvavauaaaakaaaaaaaavaaaaaaaaaaaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- ゆーきまるさん(2025/05/10)🟦15  
  (1, 'ゆーきまるさん(2025/05/10)🟦15', 'btaezaeadvvsddcanaaaaaqaaaaaaaaaaaaaaaaaqaaaaaaaaaaaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- 🥇REYさん(2025/04/30) 🟥5🟦10
  (1, '🥇REYさん(2025/04/30) 🟥5🟦10', 'btaevkeaaxacavdavaaaadvakazaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- 🥈モーリーさん(2025/04/30)🟥15
  (1, '🥈モーリーさん(2025/04/30)🟥15', 'btaavaeaaacaaaaaazvqaqvavaubaakaeaaaaaaaaaaaaaaaaaaaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- 🥇TiAさん(2025/04/19) 🟥15
  (1, '🥇TiAさん(2025/04/19) 🟥15', 'btaaaaeaavcaaaaaazvqaqvavaubaaakaaaaaaaavaaaaaaaaaaaaaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- 🥈ゆーき丸さん(2025/04/19) 🟦15
  (1, '🥈ゆーき丸さん(2025/04/19) 🟦15', 'btaazkeaeyvydebaqaaaaafaaaaaaaaaaaaaaaaafaaaaafaaaaaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- 🥉みーみーさん(2025/04/19) 🟩15
  (1, '🥉みーみーさん(2025/04/19) 🟩15', 'btdaaaeaakaaaaaaaakaaaaaaaaaaaaaaaaaaaaaaaaaaazdaaaoueraevaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- ④SOUSEIさん(2025/04/19) 🟦10🟥5
  (1, '④SOUSEIさん(2025/04/19) 🟦10🟥5', 'btevvaevaveaaaeavaaaaaqaaavaaaabaaaaakaaaaaaaaaaaavaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- hideplusさん/赤緑加速デッキ🟥7🟩8
  (1, 'hideplusさん/赤緑加速デッキ🟥7🟩8', 'btaaaaaaaacaaaaaaavaaakaqapnfackaaaaaaaaaaaaaaveaakakakaenak', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- ぽんたまるさん/緑赤デッキ🟩13🟥2
  (1, 'ぽんたまるさん/緑赤デッキ🟩13🟥2', 'btaaaaeaaaeaaaaaaaaaaaaaaaqaaaaaaaaaaaaaaaaaaaaeaaaevedjexaw', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- CNP出版部 林さん/緑青デッキ🟩10🟦5
  (1, 'CNP出版部 林さん/緑青デッキ🟩10🟦5', 'btaakadqaaaaaddakaaaaaaaaaaaaaaaaaaaaaaaaaaaaavaaaxccevbdvav', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- 公式推奨/青ミッドレンジ(バランス)🟦15
  (1, '公式推奨/青ミッドレンジ(バランス)🟦15', 'btvazkdczvaxcdeavaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- 公式推奨/赤アグロ(速攻)🟥15
  (1, '公式推奨/赤アグロ(速攻)🟥15', 'btaaaaaaaaeaaaaaazzvazvavavvacaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- 公式推奨/黄コントロール(妨害)🟨15
  (1, '公式推奨/黄コントロール(妨害)🟨15', 'btaaaaaaaaaaaaaaaaaaaaaaaaaaaaaazaeaakazzveeavaaaavaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- 公式推奨/緑ランプ(大型ユニット)🟩15
  (1, '公式推奨/緑ランプ(大型ユニット)🟩15', 'btaaaacaaaeaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaazeaaaeeezaevav', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  
  -- 公式推奨/混成テーマデッキ(セイドウ)🟦🟥
  (1, '公式推奨/混成テーマデッキ(セイドウ)🟦🟥', 'btevvaavavevaaeavaaaaaaaevkaaaaaaaaaaaaaaaaaaaaaaavaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW());

-- 確認用クエリ
SELECT deck_name, deck_id, is_public, created_at FROM saved_decks WHERE user_id = 1 ORDER BY created_at DESC;