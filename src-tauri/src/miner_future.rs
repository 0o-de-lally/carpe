use libra_tower::core::{next_proof::NextProof, proof};
use log::warn;
use std::path::{Path, PathBuf};
use tauri::{Window, Runtime};
use tokio::task::JoinHandle;
use tokio_util::sync::CancellationToken;

#[tauri::command(async)]
pub async fn start_miner_with_cancel<R: Runtime>(
  path: PathBuf,
  next: NextProof,
  token: CancellationToken,
  window: Window<R>,
) -> anyhow::Result<bool> {
  let token_clone = token.clone();
  let fut = proof_with_cancel_impl(path, next, token);

  window.once("kill-backlog-listener", move |_| {
    warn!("proof task received kill msg");
    token_clone.cancel();
  });


  Ok(fut.await?)
}

fn proof_with_cancel_impl(
  path: PathBuf,
  next: NextProof,
  cloned_token: CancellationToken,
) -> JoinHandle<bool> {
  tokio::spawn(async move {
    tokio::select! {
      // Step 3: Using cloned token to listen to cancellation requests
      _ = cloned_token.cancelled() => {
          // The token was cancelled, task can shut down
          println!("cancelled, task can shut down");
          false
      }
      _ = one_proof_sync(&path, &next) => {
          // Long work has completed
          println!("Long work has completed");
          true
      }
    }
  })
}

async fn one_proof_sync(path: &Path, next: &NextProof) -> bool{
  proof::mine_once(path, next).is_ok()
}

// use std::future::Future;
// use std::pin::Pin;
// use std::task::{Context, Poll};
// use std::time::{Duration, Instant};
// pub struct FutureVDF {
//   path: PathBuf,
//   next: NextProof,
// }
// impl Future for FutureVDF {
//     type Output = &'static str;

//     fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>)
//         -> Poll<&'static str>
//     {
//       let v = proof::mine_once(&self.path, &self.next).is_ok();
//       Poll::Ready(&v.to_string())

//     }
// }

#[tokio::test]
async fn test_cancel() {
  use libra_types::legacy_types::vdf_difficulty::VDFDifficulty;

  let t = CancellationToken::new();
  let t2 = t.clone();

  let n = NextProof {
    diff: VDFDifficulty {
      prev_diff: 0,
      prev_sec: 0,
      difficulty: 10000000,
      security: 100,
    },
    next_height:  1, // add one for next
    preimage: b"hi".to_vec(),
  };
  let path =PathBuf::from(&env!("CARGO_MANIFEST_DIR")).join("test_proof.json");
  let answer = proof_with_cancel_impl(path, n, t2);

  println!("try cancel 1");
  std::thread::sleep(std::time::Duration::from_secs(3));
  t.cancel();
  println!("try cancel 2");
  std::thread::sleep(std::time::Duration::from_secs(3));
  t.cancel();

  let r: bool = answer.await.unwrap();

  // assert!(r == false);
  dbg!(&r);
}
