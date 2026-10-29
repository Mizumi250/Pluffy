<?php

// ============================================================
// ARKZEN GENERATED SEEDER — LessonArkzenSeeder
// Tatemono: kotoba  |  Connection: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:41.625244Z
// ============================================================

namespace Database\Seeders\Arkzen\Kotoba;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LessonArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('kotoba')->table('kotoba_lessons')->truncate();

        DB::connection('kotoba')->table('kotoba_lessons')->insert([
            [
                'lang' => 'es',
                'unit' => 'Basics',
                'title' => 'Greetings',
                'emoji' => 'hand',
                'level' => 'A1',
                'position' => 1,
                'xp' => 15,
                'content' => '{"ex":[{"t":"choose","q":"Which word means hello?","o":["Hola","Gracias","Adios"],"a":0},{"t":"choose","q":"How do you say good morning?","o":["Buenas noches","Buenos dias","Buenas tardes"],"a":1},{"t":"type","q":"Type in Spanish: thank you","a":["gracias"]},{"t":"order","q":"Build: My name is Ana","w":["Me","llamo","Ana"],"a":"Me llamo Ana"},{"t":"match","p":[["hello","hola"],["goodbye","adios"],["please","por favor"],["thank you","gracias"]]}],"v":[["hola","hello"],["adios","goodbye"],["por favor","please"],["gracias","thank you"],["buenos dias","good morning"],["me llamo","my name is"]]}',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'lang' => 'es',
                'unit' => 'Basics',
                'title' => 'Introductions',
                'emoji' => 'handshake',
                'level' => 'A1',
                'position' => 2,
                'xp' => 15,
                'content' => '{"ex":[{"t":"choose","q":"How do you ask: how are you?","o":["Como estas?","Donde estas?","Que es eso?"],"a":0},{"t":"choose","q":"Mucho gusto means...","o":["Nice to meet you","See you later","I am hungry"],"a":0},{"t":"type","q":"Type in Spanish: I am a student","a":["soy estudiante","soy un estudiante","soy una estudiante"]},{"t":"order","q":"Build: I am from Mexico","w":["Soy","de","Mexico"],"a":"Soy de Mexico"},{"t":"match","p":[["where","donde"],["from","de"],["friend","amigo"],["name","nombre"]]}],"v":[["como estas","how are you"],["mucho gusto","nice to meet you"],["soy de","I am from"],["amigo","friend"],["nombre","name"]]}',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'lang' => 'es',
                'unit' => 'Food',
                'title' => 'At the cafe',
                'emoji' => 'coffee',
                'level' => 'A1',
                'position' => 3,
                'xp' => 20,
                'content' => '{"ex":[{"t":"choose","q":"Which word means water?","o":["Agua","Leche","Cafe"],"a":0},{"t":"choose","q":"How do you ask for the bill?","o":["La cuenta, por favor","Una mesa, por favor","El menu, por favor"],"a":0},{"t":"type","q":"Type in Spanish: coffee","a":["cafe"]},{"t":"order","q":"Build: I would like a coffee","w":["Quisiera","un","cafe"],"a":"Quisiera un cafe"},{"t":"match","p":[["bread","pan"],["milk","leche"],["water","agua"],["coffee","cafe"]]}],"v":[["agua","water"],["leche","milk"],["pan","bread"],["cafe","coffee"],["la cuenta","the bill"]]}',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'lang' => 'ja',
                'unit' => 'Basics',
                'title' => 'Greetings',
                'emoji' => 'flower',
                'level' => 'A1',
                'position' => 1,
                'xp' => 15,
                'content' => '{"ex":[{"t":"choose","q":"Which means hello?","o":["こんにちは","さようなら","ありがとう"],"a":0},{"t":"choose","q":"Arigatou means...","o":["Thank you","Sorry","Good night"],"a":0},{"t":"type","q":"Type in romaji: good morning (ohayou)","a":["ohayou","ohayo"]},{"t":"choose","q":"Which is used to say excuse me or sorry?","o":["すみません","おやすみ","いただきます"],"a":0},{"t":"match","p":[["hello","こんにちは"],["thank you","ありがとう"],["goodbye","さようなら"],["good morning","おはよう"]]}],"v":[["こんにちは","hello"],["ありがとう","thank you"],["さようなら","goodbye"],["おはよう","good morning"],["すみません","excuse me / sorry"]]}',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'lang' => 'ja',
                'unit' => 'Basics',
                'title' => 'Introductions',
                'emoji' => 'users',
                'level' => 'A1',
                'position' => 2,
                'xp' => 15,
                'content' => '{"ex":[{"t":"choose","q":"How do you say: I am Mika?","o":["わたしはミカです","ミカはどこですか","ありがとうミカ"],"a":0},{"t":"choose","q":"Hajimemashite means...","o":["Nice to meet you (first time)","See you tomorrow","Delicious"],"a":0},{"t":"order","q":"Build: I am a student","w":["わたしは","がくせい","です"],"a":"わたしはがくせいです"},{"t":"match","p":[["I","わたし"],["student","がくせい"],["teacher","せんせい"],["friend","ともだち"]]},{"t":"type","q":"Type in romaji: friend (tomodachi)","a":["tomodachi"]}],"v":[["わたし","I"],["がくせい","student"],["せんせい","teacher"],["ともだち","friend"],["はじめまして","nice to meet you"]]}',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'lang' => 'ja',
                'unit' => 'Food',
                'title' => 'Food and drink',
                'emoji' => 'utensils',
                'level' => 'A1',
                'position' => 3,
                'xp' => 20,
                'content' => '{"ex":[{"t":"choose","q":"Which means water?","o":["みず","おちゃ","ごはん"],"a":0},{"t":"choose","q":"Itadakimasu is said...","o":["Before eating","After eating","When leaving"],"a":0},{"t":"match","p":[["rice","ごはん"],["tea","おちゃ"],["water","みず"],["fish","さかな"]]},{"t":"type","q":"Type in romaji: delicious (oishii)","a":["oishii"]},{"t":"order","q":"Build: Water, please","w":["みずを","ください"],"a":"みずをください"}],"v":[["みず","water"],["おちゃ","tea"],["ごはん","rice / meal"],["さかな","fish"],["おいしい","delicious"]]}',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'lang' => 'en',
                'unit' => 'Conversation',
                'title' => 'Greetings and small talk',
                'emoji' => 'message-circle',
                'level' => 'A1',
                'position' => 1,
                'xp' => 15,
                'content' => '{"ex":[{"t":"choose","q":"Which is a polite greeting?","o":["Nice to meet you","Give me that","Go away"],"a":0},{"t":"choose","q":"How would you answer: How are you?","o":["I am fine, thanks. And you?","I am twenty","At the station"],"a":0},{"t":"type","q":"Type the missing word: Nice to ___ you.","a":["meet"]},{"t":"order","q":"Build: Where are you from","w":["Where","are","you","from"],"a":"Where are you from"},{"t":"match","p":[["Good morning","before noon"],["Good evening","after sunset"],["Good night","before bed"]]}],"v":[["nice to meet you","a polite first greeting"],["where are you from","asking about someone origin"],["how are you","asking about wellbeing"]]}',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'lang' => 'en',
                'unit' => 'Everyday life',
                'title' => 'Daily routine',
                'emoji' => 'clock',
                'level' => 'A2',
                'position' => 2,
                'xp' => 20,
                'content' => '{"ex":[{"t":"choose","q":"Pick the correct sentence.","o":["She wakes up at six.","She wake up at six.","She waking up at six."],"a":0},{"t":"type","q":"Type the missing word: I usually ___ breakfast at home. (eat / have)","a":["eat","have"]},{"t":"order","q":"Build: I go to work by bus","w":["I","go","to","work","by","bus"],"a":"I go to work by bus"},{"t":"choose","q":"Which word shows how often?","o":["Usually","Yesterday","Because"],"a":0},{"t":"match","p":[["wake up","start the day"],["commute","travel to work"],["brush","clean teeth"],["sleep","rest at night"]]}],"v":[["usually","most of the time"],["commute","travel to work or school"],["wake up","stop sleeping"]]}',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'lang' => 'en',
                'unit' => 'Everyday life',
                'title' => 'Talking about the past',
                'emoji' => 'history',
                'level' => 'A2',
                'position' => 3,
                'xp' => 20,
                'content' => '{"ex":[{"t":"choose","q":"Past of go?","o":["went","goed","gone"],"a":0},{"t":"choose","q":"Past of eat?","o":["ate","eated","eaten"],"a":0},{"t":"type","q":"Type the past tense of play","a":["played"]},{"t":"order","q":"Build: We watched a movie yesterday","w":["We","watched","a","movie","yesterday"],"a":"We watched a movie yesterday"},{"t":"type","q":"Type the past tense of buy","a":["bought"]}],"v":[["went","past of go"],["ate","past of eat"],["bought","past of buy"],["watched","past of watch"]]}',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
