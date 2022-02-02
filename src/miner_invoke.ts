import { invoke } from "@tauri-apps/api/tauri";
import { getCurrent } from "@tauri-apps/api/window";
import { get } from "svelte/store";
import { signingAccount } from "./accounts";
import { raise_error } from "./carpeError";
import { notify_success } from "./carpeNotify";
import { responses } from "./debug";
import { backlogListenerReady, backlogInProgress, EpochRules, minerLoopEnabled, ProofProgress, tower, minerProofComplete, minerEventReceived, backlogSubmitted, clearDisplayErrors } from "./miner";
import { network_profile } from "./networks";

const current_window = getCurrent();


export const towerOnce = async () => {
  console.log("mine tower once")
  minerEventReceived.set(false);
  minerProofComplete.set(false);
  
  let previous_duration = get(network_profile).chain_id == "Mainnet"
    ? 30 * 60 * 1000
    : 5 * 1000;

  let t = get(tower);
  if (t.progress && t.progress.time_start) {
    previous_duration = Date.now() - t.progress.time_start;
  }

  let progress: ProofProgress = {
    time_start: Date.now(),
    previous_duration,
    complete: false,
    error: false,
    pct_complete: 0
  }
  t.progress = progress;
  tower.set(t);

  return invoke("miner_once", {})
    .then(res => {
      console.log('>>> miner_once response: ' + res);
      responses.set(res as string);
      proofComplete();

      // start the sending of txs
      emitBacklog();

      return res
    })
    .catch(e => {
      console.log('>>> miner_once error: ' + e);
      // disable mining when there is a proof error.
      minerLoopEnabled.set(false);
      raise_error(e, false, "invoke");
      proofError()
      return false
    });

};

export const maybeStartMiner = () => {
  // maybe try to start a new proof
  console.log("maybeStartMiner");

  let t = get(tower);
  let proofComplete = (t && t.progress && t.progress.complete);
  console.log(proofComplete);

  if (
    // user must have set mining switch on
    get(minerLoopEnabled) &&
    // there should be no backlog in progress
    !get(backlogInProgress) &&
    // only try to restart if a proof has completed.
    proofComplete
  ){ 
    towerOnce(); 
  };
}

// Only the backlog service needs a listener
export const startBacklogListener = async () => {
  await invoke("start_backlog_sender_listener", {})
    .then((res) => {
      responses.set(res as string);
      backlogListenerReady.set(true);
      return res
    })
    .catch((e) => raise_error(e, false, "startBacklogListener"));
}

// Stop listening on the rust side for new requests to mine a proof.
export const killBacklogListener = async () => {
  console.log("kill listener");
  return current_window.emit("kill-backlog-listener").then( _ => backlogListenerReady.set(false));
}

export const emitBacklog = async () => {
  backlogInProgress.set(true);
  clearDisplayErrors();
  current_window.emit('send-backlog', 'please...');
}

export const maybeEmitBacklogDelta = async () => {
  console.log("maybeEmitBacklogDelta");
  if (get(backlogListenerReady)) {
    let t = get(tower);
    if (t.local_height && t.on_chain.verified_tower_height) {
      if ((t.local_height - t.on_chain.verified_tower_height) > 0) {
        emitBacklog();
      }
    }
  } else {
    console.log("backlog listener not ready")
  }
}


export const getTowerChainView = async () => {
  console.log("getTowerChainView");

  await invoke("get_onchain_tower_state", {
    account: get(signingAccount).account
  })
    .then((res: EpochRules) => {
      let t = get(tower);
      t.on_chain = res;
      tower.set(t);
      responses.set(JSON.stringify(res));
    })
    .catch((e) => {
      //need to reset, otherwise may be looking at wrong account
      let t = get(tower);
      t.on_chain = {};
      tower.set(t);

      raise_error(e, true, "getTowerChainView")
    });
};

// update the `tower.local_proof`
export const getLocalHeight = async () => {
  console.log("getLocalHeight");
  await invoke("get_local_height", {})
    .then((res: number) => {
      console.log(res);
      // if res.
      let t = get(tower);
      t.local_height = res;
      tower.set(t);
      responses.set(JSON.stringify(res));
    })
    .catch((e) => {
      let t = get(tower);
      t.local_height = -1;
      tower.set(t);
      raise_error(e, true, "getLocalHeight")
    });
};

export const getEpochRules = async () => {
  console.log("getEpochRules");
  await invoke("get_epoch_rules", {})
    .then((res: EpochRules) => {
      console.log(res);
      // if res.
      let t = get(tower);
      t.rules = res;
      tower.set(t);
      responses.set(JSON.stringify(res));
    })
    .catch((e) => {
      raise_error(e, true, "getEpochRules")
    });
};



export function proofError() {
  let t = get(tower);
  t.progress.error = true;
  tower.set(t);
}

export function proofComplete() {
  let t = get(tower);
  t.progress.complete = true;
  tower.set(t);

  minerProofComplete.set(true);
}



// submit any transactions that are in the backlog. Proofs that have been mined but for any reason were not committed.
export const submitBacklog = async () => {
  console.log('submitBacklog called');
  clearDisplayErrors();
  backlogInProgress.set(true);
  invoke("submit_backlog", {})
    .then(res => {
      backlogInProgress.set(false);
      backlogSubmitted.set(true);
      console.log('submit_backlog response: ' + res);
      responses.set(res as string);
      notify_success("Backlog submitted");
      return res
    })
    .catch(e => {
      backlogInProgress.set(false);
      backlogSubmitted.set(false);
      console.log('>>> submit_backlog error: ' + e);
      raise_error(e, false, "submitBacklog");
    });
}

// For debugging or rescue purposes. Sometimes the user may have a proof that for some reason was not committed to the chain.

export const submitProofZero = async () => {
  backlogInProgress.set(true);
  invoke("debug_submit_proof_zero", {})
    .then((res) => {
      console.log(res);
      responses.set(res as string);
      return res
    })
    .catch((e) => {
      raise_error(e, false, "submitProofZero");
    });
}

