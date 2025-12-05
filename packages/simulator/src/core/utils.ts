import { CellInfo, CellType, DnaHash, HoloHashMap,
	Action,
	ActionType,
ActionHash,
hashFromContentAndType,
HoloHashType,
} from '@holochain/client';
import { encode } from '@msgpack/msgpack';

import { AppRole, SimulatedDna } from '../dnas/simulated-dna';
import { Dictionary } from '../types';

export function simulatedRolesToCellInfo(
	roles: Dictionary<AppRole>,
	registeredDnas: HoloHashMap<DnaHash, SimulatedDna>,
): Dictionary<CellInfo[]> {
	const origin_time = Date.now() * 1000;
	const quantum_time = {
		secs: 1000,
		nanos: 0,
	};
	const cellInfo: Dictionary<CellInfo[]> = {};
	for (const [roleName, role] of Object.entries(roles)) {
		cellInfo[roleName] = role.is_provisioned
			? [
					{
						type: CellType.Provisioned,
						value: {
							cell_id: role.base_cell_id,
							dna_modifiers: {
								network_seed: registeredDnas.get(role.base_cell_id[0])
									.networkSeed,
								properties: encode(
									registeredDnas.get(role.base_cell_id[0]).properties,
								),
							},
							name: roleName,
						},
					},
				]
			: [];

		for (const [cloneName, clone] of Object.entries(role.clones)) {
			cellInfo[roleName].push({
				type: CellType.Cloned,
				value: {
					cell_id: clone,
					enabled: true,
					original_dna_hash: role.base_cell_id[0],
					dna_modifiers: {
						network_seed: registeredDnas.get(clone[0]).networkSeed,
						properties: encode(registeredDnas.get(clone[0]).properties),
					},
					clone_id: cloneName,
					name: roleName,
				},
			});
		}
	}
	return cellInfo;
}


// The hash of an action depends on the order of keys
// To make it deterministic and aligned with hashes of actions coming from holochain
// we need to enforce the order of actions to align with the holochain ones
function sortActionKeys(action: Action): Action {
	const weight = (action as any).weight;
	switch (action.type) {
		case ActionType.Dna:
			return {
				type: ActionType.Dna,
				author: action.author,
				timestamp: action.timestamp,
				hash: action.hash,
			};
		case ActionType.AgentValidationPkg:
			return {
				type: ActionType.AgentValidationPkg,
				author: action.author,
				timestamp: action.timestamp,
				action_seq: action.action_seq,
				prev_action: action.prev_action,
				membrane_proof: action.membrane_proof,
			};
		case ActionType.InitZomesComplete:
			return {
				type: ActionType.InitZomesComplete,
				author: action.author,
				timestamp: action.timestamp,
				action_seq: action.action_seq,
				prev_action: action.prev_action,
			};
		case ActionType.CreateLink:
			return {
				type: ActionType.CreateLink,
				author: action.author,
				timestamp: action.timestamp,
				action_seq: action.action_seq,
				prev_action: action.prev_action,

				base_address: action.base_address,
				target_address: action.target_address,
				zome_index: action.zome_index,
				link_type: action.link_type,
				tag: action.tag,
				weight: {
					bucket_id: action.weight.bucket_id,
					units: action.weight.units,
				},
			};
		case ActionType.DeleteLink:
			return {
				type: ActionType.DeleteLink,
				author: action.author,
				timestamp: action.timestamp,
				action_seq: action.action_seq,
				prev_action: action.prev_action,
				base_address: action.base_address,
				link_add_address: action.link_add_address,
			};
		case ActionType.OpenChain:
			return {
				type: ActionType.OpenChain,
				author: action.author,
				timestamp: action.timestamp,
				action_seq: action.action_seq,
				prev_action: action.prev_action,
				prev_dna_hash: action.prev_dna_hash,
			};
		case ActionType.CloseChain:
			return {
				type: ActionType.CloseChain,
				author: action.author,
				timestamp: action.timestamp,
				action_seq: action.action_seq,
				prev_action: action.prev_action,
				new_dna_hash: action.new_dna_hash,
			};
		case ActionType.Create:
			return {
				type: ActionType.Create,
				author: action.author,
				timestamp: action.timestamp,
				action_seq: action.action_seq,
				prev_action: action.prev_action,
				entry_type: action.entry_type,
				entry_hash: action.entry_hash,
				weight: {
					bucket_id: weight.bucket_id,
					units: weight.units,
					rate_bytes: weight.rate_bytes,
				},
			} as any;
		case ActionType.Update:
			return {
				type: ActionType.Update,
				author: action.author,
				timestamp: action.timestamp,
				action_seq: action.action_seq,
				prev_action: action.prev_action,

				original_action_address: action.original_action_address,
				original_entry_address: action.original_entry_address,

				entry_type: action.entry_type,
				entry_hash: action.entry_hash,
				weight: {
					bucket_id: weight.bucket_id,
					units: weight.units,
					rate_bytes: weight.rate_bytes,
				},
			} as any;
		case ActionType.Delete:
			return {
				type: ActionType.Delete,
				author: action.author,
				timestamp: action.timestamp,
				action_seq: action.action_seq,
				prev_action: action.prev_action,

				deletes_address: action.deletes_address,
				deletes_entry_address: action.deletes_entry_address,
				weight: {
					bucket_id: weight.bucket_id,
					units: weight.units,
				},
			} as any;
	}
}

export function hashAction(action: Action): ActionHash {
	return hashFromContentAndType(sortActionKeys(action), HoloHashType.Action);
}

