import fetch from 'node-fetch';

async function testPerplexityParsing() {
  console.log('🧪 Testing Perplexity API response parsing\n');

  // Test data
  const testProduct = {
    product_name: 'Keytruda',
    generic_name: 'pembrolizumab',
    indication: 'melanoma treatment',
    company: 'Merck'
  };

  console.log('📤 Sending request to Perplexity...');
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{
          role: 'system',
          content: 'You are an expert pharmaceutical SEO content writer. Always respond with valid JSON only, no markdown formatting.'
        }, {
          role: 'user',
          content: `Generate SEO content for ${testProduct.product_name}. Return ONLY a JSON object with these exact keys:
{
  "seo_title": "60 chars max title",
  "meta_description": "155 chars max description",
  "seo_keywords": ["keyword1", "keyword2", "..."],
  "h2_tags": ["heading1", "heading2", "..."],
  "seo_strategy": "brief strategy text"
}`
        }],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    const data = await response.json();
    console.log('\n📥 Raw Response:');
    console.log(JSON.stringify(data, null, 2));

    if (data.choices && data.choices[0]) {
      const content = data.choices[0].message.content;
      console.log('\n📄 Message Content:');
      console.log(content);
      console.log(`\nContent Type: ${typeof content}`);
      console.log(`Content Length: ${content.length}`);

      // Try different parsing approaches
      console.log('\n🔍 Parsing Attempts:');
      
      // Attempt 1: Direct parse
      try {
        const parsed = JSON.parse(content);
        console.log('✅ Direct JSON.parse succeeded');
        console.log('Parsed keys:', Object.keys(parsed));
        console.log('seo_title:', parsed.seo_title);
      } catch (e) {
        console.log('❌ Direct JSON.parse failed:', e.message);
      }

      // Attempt 2: Extract JSON with regex
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Regex extraction succeeded');
          console.log('Parsed keys:', Object.keys(parsed));
          console.log('seo_title:', parsed.seo_title);
        } else {
          console.log('❌ No JSON object found with regex');
        }
      } catch (e) {
        console.log('❌ Regex extraction failed:', e.message);
      }

      // Attempt 3: Clean markdown and parse
      try {
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        console.log('✅ Markdown cleaning succeeded');
        console.log('Parsed keys:', Object.keys(parsed));
        console.log('seo_title:', parsed.seo_title);
      } catch (e) {
        console.log('❌ Markdown cleaning failed:', e.message);
      }
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testPerplexityParsing();