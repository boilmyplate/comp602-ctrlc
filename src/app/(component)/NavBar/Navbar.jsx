"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faCog, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import styles from "@/app/(component)/NavBar/Navbar.module.css";
import { auth } from "../Firebase/firebase";
import { doSignOut } from "../Firebase/auth";

// Links on navbar
const links = [
  { title: "Homepage", path: "/" },
  { title: "Game", path: "/gamelibrary" },
  { title: "Journal", path: "/journal" },
  {
    title: "Features",
    submenu: [
      { title: "Breathing Exercise", path: "/breath" },
      { title: "Calendar", path: "/calendar" },
    ],
  },
];

const NavLink = ({ item }) => {
  const pathName = usePathname();
  const [submenuOpen, setSubmenuOpen] = useState(false);

  if (item.submenu) {
    return (
      <div
        className={styles.navItem}
        onMouseLeave={() => setSubmenuOpen(false)}
      >
        <button
          className={`${styles.link} ${styles.featuresButton}`}
          onClick={() => setSubmenuOpen(!submenuOpen)}
        >
          {item.title}
        </button>
        {submenuOpen && (
          <div className={styles.submenu}>
            {item.submenu.map((subitem) => (
              <Link href={subitem.path} key={subitem.title} passHref>
                <button
                  className={`${styles.sublink} ${
                    pathName === subitem.path ? styles.active : ""
                  }`}
                >
                  {subitem.title}
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  } else {
    return (
      <Link href={item.path} passHref>
        <button
          className={`${styles.link} ${
            pathName === item.path ? styles.active : ""
          }`}
        >
          {item.title}
        </button>
      </Link>
    );
  }
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  // Profile dropdown state
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef();
  const user = auth.currentUser;
  const pathName = usePathname(); // Added this line

  // Close profile dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <span className={styles.logoBlank}>Blank</span>
        <span className={styles.logoWeb}>Web</span>
      </div>

      {/* Desktop Links */}
      <div className={styles.links}>
        {links.map((link) => (
          <NavLink item={link} key={link.title} />
        ))}

        {/* Profile Picture */}
        <div className={styles.profileContainer} ref={menuRef}>
          <div
            className={styles.menuTrigger}
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          >
            <Image
              src="/profile.png"
              alt="Profile Picture"
              width={50}
              height={50}
              className={styles.heroImg}
            />
          </div>

          {/* Dropdown menu */}
          {profileMenuOpen && (
            <div className={styles.dropdownMenu}>
              <h3>
                {user.displayName}
                <br />
                <span>{user.email}</span>
              </h3>
              <ul>
                <li className={styles.dropdownItem}>
                  <FontAwesomeIcon icon={faCog} />
                  <Link href="/setting">Settings</Link>
                </li>
                <li className={styles.dropdownItem}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <Link href="/" onClick={doSignOut}>
                    Logout
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Hamburger Icon for mobile view */}
      <div
        className={styles.menuIcon}
        onClick={() => setOpen((prev) => !prev)}
      >
        <FontAwesomeIcon icon={faBars} />
      </div>

      {/* Mobile Links */}
      {open && (
        <div className={styles.mobileLinks}>
          {links.flatMap((link) =>
            link.submenu
              ? link.submenu.map((subitem) => (
                  <Link href={subitem.path} key={subitem.title} passHref>
                    <button
                      className={`${styles.link} ${
                        pathName === subitem.path ? styles.active : ""
                      }`}
                    >
                      {subitem.title}
                    </button>
                  </Link>
                ))
              : (
                <Link href={link.path} key={link.title} passHref>
                  <button
                    className={`${styles.link} ${
                      pathName === link.path ? styles.active : ""
                    }`}
                  >
                    {link.title}
                  </button>
                </Link>
              )
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
