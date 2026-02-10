import { useState, useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { supabase, ApiKey, Model } from '../lib/supabase';

const CORRECT_PIN = '3642';

interface ConsoleMessage {
  type: 'input' | 'output' | 'error' | 'success';
  text: string;
}

export default function Console() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [messages, setMessages] = useState<ConsoleMessage[]>([
    { type: 'output', text: '╔═══════════════════════════════════════════════════╗' },
    { type: 'output', text: '║       LAQUEUS-ENGINE v1.0                        ║' },
    { type: 'output', text: '║       by Sparrow AI Solutions                    ║' },
    { type: 'output', text: '╚═══════════════════════════════════════════════════╝' },
    { type: 'output', text: '' },
    { type: 'output', text: 'System locked. Enter PIN to continue...' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addMessage = (text: string, type: ConsoleMessage['type'] = 'output') => {
    setMessages(prev => [...prev, { type, text }]);
  };

  const handlePinEntry = (pin: string) => {
    addMessage(`> ${pin.replace(/./g, '*')}`, 'input');
    if (pin === CORRECT_PIN) {
      setIsUnlocked(true);
      addMessage('✓ Access granted', 'success');
      addMessage('', 'output');
      addMessage('Type "help" to see available commands', 'output');
      addMessage('Type "doc" to view full documentation', 'output');
      addMessage('', 'output');
    } else {
      addMessage('✗ Access denied: Invalid PIN', 'error');
    }
  };

  const executeCommand = async (cmd: string) => {
    const parts = cmd.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    addMessage(`> ${cmd}`, 'input');

    switch (command) {
      case 'help':
        handleHelp();
        break;
      case 'doc':
        handleDoc();
        break;
      case 'about':
        handleAbout();
        break;
      case 'setupkey':
        await handleSetupKey(args);
        break;
      case 'setupmodel':
        await handleSetupModel(args);
        break;
      case 'listkeys':
        await handleListKeys();
        break;
      case 'listmodels':
        await handleListModels();
        break;
      case 'deletekey':
        await handleDeleteKey(args);
        break;
      case 'deletemodel':
        await handleDeleteModel(args);
        break;
      case 'clear':
        handleClear();
        break;
      case 'endpoint':
        handleEndpoint();
        break;
      case '':
        break;
      default:
        addMessage(`✗ Unknown command: ${command}`, 'error');
        addMessage('Type "help" for available commands', 'output');
    }
  };

  const handleHelp = () => {
    addMessage('', 'output');
    addMessage('═══════════════ AVAILABLE COMMANDS ═══════════════', 'output');
    addMessage('', 'output');
    addMessage('help              - Show this help message', 'output');
    addMessage('doc               - View full documentation', 'output');
    addMessage('about             - About Laqueus Engine', 'output');
    addMessage('endpoint          - Show API endpoint URL', 'output');
    addMessage('', 'output');
    addMessage('setupkey <name> <key>  - Add new OpenRouter API key', 'output');
    addMessage('listkeys          - List all API keys', 'output');
    addMessage('deletekey <id>    - Delete API key by ID', 'output');
    addMessage('', 'output');
    addMessage('setupmodel <model> <display>  - Add new model', 'output');
    addMessage('listmodels        - List all models', 'output');
    addMessage('deletemodel <id>  - Delete model by ID', 'output');
    addMessage('', 'output');
    addMessage('clear             - Clear console', 'output');
    addMessage('═══════════════════════════════════════════════════', 'output');
    addMessage('', 'output');
  };

  const handleDoc = () => {
    addMessage('', 'output');
    addMessage('╔═══════════════════════════════════════════════════╗', 'output');
    addMessage('║         LAQUEUS-ENGINE DOCUMENTATION              ║', 'output');
    addMessage('╚═══════════════════════════════════════════════════╝', 'output');
    addMessage('', 'output');
    addMessage('OVERVIEW:', 'output');
    addMessage('Laqueus Engine is an intelligent API routing system that', 'output');
    addMessage('manages multiple OpenRouter API keys and models with', 'output');
    addMessage('automatic fallback capabilities.', 'output');
    addMessage('', 'output');
    addMessage('FEATURES:', 'output');
    addMessage('• Multiple API key management with priority-based fallback', 'output');
    addMessage('• Multiple model support with automatic switching', 'output');
    addMessage('• Console-based configuration interface', 'output');
    addMessage('• PIN-protected access (PIN: 3642)', 'output');
    addMessage('• RESTful API endpoint for chat completions', 'output');
    addMessage('', 'output');
    addMessage('HOW IT WORKS:', 'output');
    addMessage('1. Add one or more OpenRouter API keys using setupkey', 'output');
    addMessage('2. Add one or more models using setupmodel', 'output');
    addMessage('3. Make requests to the API endpoint', 'output');
    addMessage('4. System automatically handles fallback if a key/model fails', 'output');
    addMessage('', 'output');
    addMessage('FALLBACK SYSTEM:', 'output');
    addMessage('Keys and models are tried in priority order (lowest first).', 'output');
    addMessage('If a request fails, the system automatically tries the next', 'output');
    addMessage('available key/model combination until success or exhaustion.', 'output');
    addMessage('', 'output');
    addMessage('API ENDPOINT:', 'output');
    addMessage('POST /functions/v1/openrouter-proxy', 'output');
    addMessage('', 'output');
    addMessage('Request Body:', 'output');
    addMessage('{', 'output');
    addMessage('  "message": "Your prompt here"', 'output');
    addMessage('}', 'output');
    addMessage('', 'output');
    addMessage('Response:', 'output');
    addMessage('{', 'output');
    addMessage('  "response": "AI generated response",', 'output');
    addMessage('  "model_used": "model-identifier",', 'output');
    addMessage('  "key_used": "key-name"', 'output');
    addMessage('}', 'output');
    addMessage('', 'output');
    addMessage('EXAMPLES:', 'output');
    addMessage('', 'output');
    addMessage('Add API Key:', 'output');
    addMessage('  setupkey primary sk-or-v1-abc123...', 'output');
    addMessage('', 'output');
    addMessage('Add Model:', 'output');
    addMessage('  setupmodel google/gemini-2.0-flash-001 "Gemini Flash"', 'output');
    addMessage('  setupmodel meta-llama/llama-3.2-3b-instruct:free "Llama 3B"', 'output');
    addMessage('', 'output');
    addMessage('List Resources:', 'output');
    addMessage('  listkeys', 'output');
    addMessage('  listmodels', 'output');
    addMessage('', 'output');
    addMessage('Delete Resources:', 'output');
    addMessage('  deletekey <uuid>', 'output');
    addMessage('  deletemodel <uuid>', 'output');
    addMessage('', 'output');
    addMessage('RECOMMENDED FREE MODELS:', 'output');
    addMessage('• meta-llama/llama-3.2-3b-instruct:free', 'output');
    addMessage('• meta-llama/llama-3.2-1b-instruct:free', 'output');
    addMessage('• google/gemini-2.0-flash-001 (if available)', 'output');
    addMessage('• mistralai/mistral-7b-instruct:free', 'output');
    addMessage('', 'output');
    addMessage('For more info: https://openrouter.ai/models', 'output');
    addMessage('', 'output');
  };

  const handleAbout = () => {
    addMessage('', 'output');
    addMessage('╔═══════════════════════════════════════════════════╗', 'output');
    addMessage('║         LAQUEUS-ENGINE v1.0                       ║', 'output');
    addMessage('║         by Sparrow AI Solutions                   ║', 'output');
    addMessage('╚═══════════════════════════════════════════════════╝', 'output');
    addMessage('', 'output');
    addMessage('An intelligent API routing and fallback system', 'output');
    addMessage('for OpenRouter API integration.', 'output');
    addMessage('', 'output');
    addMessage('Features:', 'output');
    addMessage('• Multi-key fallback system', 'output');
    addMessage('• Multi-model support', 'output');
    addMessage('• Console-based management', 'output');
    addMessage('• Enterprise-grade reliability', 'output');
    addMessage('', 'output');
    addMessage('© 2026 Sparrow AI Solutions. All rights reserved.', 'output');
    addMessage('', 'output');
  };

  const handleSetupKey = async (args: string[]) => {
    if (args.length < 2) {
      addMessage('✗ Usage: setupkey <name> <api_key>', 'error');
      return;
    }

    const [keyName, apiKey] = args;

    try {
      const { data: existingKeys } = await supabase
        .from('api_keys')
        .select('priority')
        .order('priority', { ascending: false })
        .limit(1);

      const nextPriority = existingKeys && existingKeys.length > 0
        ? existingKeys[0].priority + 1
        : 0;

      const { error } = await supabase
        .from('api_keys')
        .insert({
          key_name: keyName,
          api_key: apiKey,
          priority: nextPriority,
        });

      if (error) throw error;

      addMessage(`✓ API key "${keyName}" added successfully`, 'success');
      addMessage(`  Priority: ${nextPriority}`, 'output');
    } catch (error) {
      addMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleSetupModel = async (args: string[]) => {
    if (args.length < 2) {
      addMessage('✗ Usage: setupmodel <model_name> <display_name>', 'error');
      addMessage('  Example: setupmodel meta-llama/llama-3.2-3b-instruct:free "Llama 3B"', 'output');
      return;
    }

    const modelName = args[0];
    const displayName = args.slice(1).join(' ').replace(/^["']|["']$/g, '');

    try {
      const { data: existingModels } = await supabase
        .from('models')
        .select('priority')
        .order('priority', { ascending: false })
        .limit(1);

      const nextPriority = existingModels && existingModels.length > 0
        ? existingModels[0].priority + 1
        : 0;

      const { error } = await supabase
        .from('models')
        .insert({
          model_name: modelName,
          display_name: displayName,
          priority: nextPriority,
        });

      if (error) throw error;

      addMessage(`✓ Model "${displayName}" added successfully`, 'success');
      addMessage(`  Identifier: ${modelName}`, 'output');
      addMessage(`  Priority: ${nextPriority}`, 'output');
    } catch (error) {
      addMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleListKeys = async () => {
    try {
      const { data: keys, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;

      if (!keys || keys.length === 0) {
        addMessage('No API keys configured', 'output');
        addMessage('Use "setupkey <name> <key>" to add one', 'output');
        return;
      }

      addMessage('', 'output');
      addMessage('═══════════════ API KEYS ═══════════════', 'output');
      keys.forEach((key: ApiKey) => {
        addMessage('', 'output');
        addMessage(`ID: ${key.id}`, 'output');
        addMessage(`Name: ${key.key_name}`, 'output');
        addMessage(`Key: ${key.api_key.substring(0, 20)}...`, 'output');
        addMessage(`Priority: ${key.priority}`, 'output');
        addMessage(`Status: ${key.is_active ? '✓ Active' : '✗ Inactive'}`, 'output');
      });
      addMessage('═══════════════════════════════════════', 'output');
      addMessage('', 'output');
    } catch (error) {
      addMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleListModels = async () => {
    try {
      const { data: models, error } = await supabase
        .from('models')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;

      if (!models || models.length === 0) {
        addMessage('No models configured', 'output');
        addMessage('Use "setupmodel <model> <display>" to add one', 'output');
        return;
      }

      addMessage('', 'output');
      addMessage('═══════════════ MODELS ═══════════════', 'output');
      models.forEach((model: Model) => {
        addMessage('', 'output');
        addMessage(`ID: ${model.id}`, 'output');
        addMessage(`Display Name: ${model.display_name}`, 'output');
        addMessage(`Model: ${model.model_name}`, 'output');
        addMessage(`Priority: ${model.priority}`, 'output');
        addMessage(`Status: ${model.is_active ? '✓ Active' : '✗ Inactive'}`, 'output');
      });
      addMessage('═══════════════════════════════════════', 'output');
      addMessage('', 'output');
    } catch (error) {
      addMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleDeleteKey = async (args: string[]) => {
    if (args.length === 0) {
      addMessage('✗ Usage: deletekey <id>', 'error');
      addMessage('  Use "listkeys" to see available IDs', 'output');
      return;
    }

    const id = args[0];

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      addMessage(`✓ API key deleted successfully`, 'success');
    } catch (error) {
      addMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleDeleteModel = async (args: string[]) => {
    if (args.length === 0) {
      addMessage('✗ Usage: deletemodel <id>', 'error');
      addMessage('  Use "listmodels" to see available IDs', 'output');
      return;
    }

    const id = args[0];

    try {
      const { error } = await supabase
        .from('models')
        .delete()
        .eq('id', id);

      if (error) throw error;

      addMessage(`✓ Model deleted successfully`, 'success');
    } catch (error) {
      addMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleEndpoint = () => {
    const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openrouter-proxy`;
    addMessage('', 'output');
    addMessage('API ENDPOINT:', 'output');
    addMessage(endpoint, 'success');
    addMessage('', 'output');
    addMessage('Usage:', 'output');
    addMessage('POST request with JSON body:', 'output');
    addMessage('{ "message": "Your prompt here" }', 'output');
    addMessage('', 'output');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!isUnlocked) {
      handlePinEntry(inputValue);
    } else {
      setCommandHistory(prev => [...prev, inputValue]);
      setHistoryIndex(-1);
      executeCommand(inputValue);
    }

    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInputValue('');
        } else {
          setHistoryIndex(newIndex);
          setInputValue(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div className="w-screen h-screen bg-white text-black font-mono flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 sm:px-6 py-3 border-b-2 border-black flex-shrink-0">
        <Terminal className="w-5 h-5 sm:w-6 sm:h-6" />
        <h1 className="text-lg sm:text-xl font-bold truncate">LAQUEUS-ENGINE CONSOLE</h1>
      </div>

      <div className="flex-1 bg-gray-50 border-b-2 border-black overflow-y-auto p-3 sm:p-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-1 text-xs sm:text-sm break-words ${
              msg.type === 'input' ? 'text-blue-600 font-bold' :
              msg.type === 'error' ? 'text-red-600' :
              msg.type === 'success' ? 'text-green-600' :
              'text-black'
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border-t-2 border-black flex-shrink-0">
        <span className="text-black font-bold text-xs sm:text-base">&gt;</span>
        <input
          ref={inputRef}
          type={isUnlocked ? 'text' : 'password'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-white border-2 border-black px-2 sm:px-3 py-1 sm:py-2 font-mono text-xs sm:text-base focus:outline-none focus:border-blue-600"
          placeholder={isUnlocked ? 'Enter command...' : 'Enter PIN...'}
          autoComplete="off"
        />
      </form>

      <div className="px-3 sm:px-4 py-1 sm:py-2 text-xs text-gray-600 text-center border-t border-gray-300 flex-shrink-0">
        Press ↑/↓ for history
      </div>
    </div>
  );
}
