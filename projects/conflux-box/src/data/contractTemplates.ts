import { generatedContractTemplates } from './generatedContractTemplates';

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  abi: any[];
  bytecode: string;
  constructorArgs?: {
    name: string;
    type: string;
    description: string;
    defaultValue?: string;
  }[];
}

function mapGenerated(): ContractTemplate[] {
  try {
    const gen: Record<string, any> = (generatedContractTemplates as any) || {};
    const templates: ContractTemplate[] = [];

    if (gen.Storage) {
      templates.push({
        id: 'storage',
        name: 'Storage Contract',
        description: 'Basic storage contract with set/get methods (generated)',
        category: 'Basic',
        constructorArgs: [],
        abi: gen.Storage.abi as any[],
        bytecode: gen.Storage.fullBytecode as string,
      });
    }

    if (gen.Counter) {
      templates.push({
        id: 'counter',
        name: 'Counter',
        description: 'Simple counter with increment/decrement (generated)',
        category: 'Basic',
        constructorArgs: [],
        abi: gen.Counter.abi as any[],
        bytecode: gen.Counter.fullBytecode as string,
      });
    }

    if (gen.SimpleStorage) {
      templates.push({
        id: 'simple-storage',
        name: 'Simple Storage',
        description: 'SimpleStorage with name and value (generated)',
        category: 'Basic',
        constructorArgs: [
          {
            name: 'name',
            type: 'string',
            description: 'Initial name',
            defaultValue: 'Example',
          },
          {
            name: 'initialValue',
            type: 'uint256',
            description: 'Initial value',
            defaultValue: '0',
          },
        ],
        abi: gen.SimpleStorage.abi as any[],
        bytecode: gen.SimpleStorage.fullBytecode as string,
      });
    }

    return templates;
  } catch (_e) {
    return [];
  }
}

export const contractTemplates: ContractTemplate[] = [...mapGenerated()];
