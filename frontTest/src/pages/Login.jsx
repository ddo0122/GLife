import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css"; // 추가: 스타일 파일

export default function Login(){
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  // 로그인 후 기본 이동 경로를 대시보드로 (이전 페이지 정보가 있을 땐 거기로)
  const from = loc.state?.from?.pathname || "/dashboard";

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e){
    e.preventDefault();
    setErr("");
    if(!id || !pw){ setErr("아이디와 비밀번호를 입력하세요."); return; }
    try{
      setLoading(true);
      await login({ id, password: pw });
      nav(from, { replace: true });
    }catch(e){
      setErr(e?.message || "로그인에 실패했습니다.");
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="glass-card">
        <div className="login-header">
          <div className="login-title">로그인</div>
          <div className="login-subtitle">산업 안전교육 관리 플랫폼</div>
        </div>

        <form onSubmit={onSubmit} className="login-form">
          <div className="form-field">
            <label className="label">아이디</label>
            <input
              type="text"
              value={id}
              onChange={(e)=>setId(e.target.value)}
              placeholder="아이디"
              className="input"
              autoFocus
            />
          </div>

          <div className="form-field">
            <label className="label">비밀번호</label>
            <div className="password-row">
              <input
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e)=>setPw(e.target.value)}
                placeholder="비밀번호"
                className="input"
              />
              <button
                type="button"
                onClick={()=>setShow(v=>!v)}
                className="btn btn-ghost"
                aria-label={show ? "비밀번호 숨기기" : "비밀번호 표시"}
              >
                {show ? "숨기기" : "표시"}
              </button>
            </div>
          </div>

          {err && <div className="error-text">{err}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <a className="link" href="/signup">회원가입</a>
        </form>
      </div>
    </div>
  );
}
